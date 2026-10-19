package com.ecommerce.backend.controller;

import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    /**
     * POST /api/payment/create-order
     * Called by frontend when user clicks "Pay Online"
     * Returns a Razorpay order ID that the frontend uses to open the payment popup
     * Requires JWT authentication
     */
    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> body) {

        try {
            // amount in frontend is ₹ (rupees) — Razorpay needs paise (1 rupee = 100 paise)
            int amountRupees = ((Number) body.get("amount")).intValue();
            int amountPaise = amountRupees * 100;

            RazorpayClient client = new RazorpayClient(keyId, keySecret);

            JSONObject options = new JSONObject();
            options.put("amount", amountPaise);
            options.put("currency", "INR");
            options.put("receipt", "order_" + System.currentTimeMillis());
            options.put("payment_capture", 1); // auto-capture payment

            com.razorpay.Order razorpayOrder = client.orders.create(options);

            return ResponseEntity.ok(Map.of(
                    "razorpayOrderId", (Object) razorpayOrder.get("id").toString(),
                    "amount",          amountPaise,
                    "currency",        "INR",
                    "keyId",           keyId
            ));

        } catch (Exception e) {
            throw new RuntimeException("Payment initiation failed: " + e.getMessage());
        }
    }

    /**
     * POST /api/payment/verify
     * Called after Razorpay payment popup closes with success
     * Verifies the payment signature to prevent fraud
     * Returns success = true if verified, frontend then calls POST /api/orders
     */
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {

        try {
            String razorpayOrderId   = body.get("razorpay_order_id");
            String razorpayPaymentId = body.get("razorpay_payment_id");
            String razorpaySignature = body.get("razorpay_signature");

            // Generate expected signature using HMAC SHA256
            // Formula: HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, key_secret)
            String generatedSignature = Utils.getHash(
                    razorpayOrderId + "|" + razorpayPaymentId,
                    keySecret
            );

            if (generatedSignature.equals(razorpaySignature)) {
                return ResponseEntity.ok(Map.of(
                        "verified",   (Object) true,
                        "paymentId",  razorpayPaymentId,
                        "message",    "Payment verified successfully"
                ));
            } else {
                throw new RuntimeException("Payment signature mismatch — possible fraud attempt");
            }

        } catch (Exception e) {
            throw new RuntimeException("Payment verification failed: " + e.getMessage());
        }
    }
}
