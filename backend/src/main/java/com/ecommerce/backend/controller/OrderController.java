package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.PlaceOrderRequest;
import com.ecommerce.backend.model.Order;
import com.ecommerce.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// BUG FIXED: Was using OrderRequest DTO, but frontend sends PlaceOrderRequest format.
// That mismatch caused order placement to either 400 (bad request) or silently fail.

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * POST /api/orders
     * Requires: Authorization: Bearer <token> header
     * @AuthenticationPrincipal injects the logged-in user from the JWT token
     */
    @PostMapping
    public ResponseEntity<Order> placeOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody PlaceOrderRequest request) {

        Order order = orderService.placeOrder(userDetails.getUsername(), request);
        return ResponseEntity.ok(order);
    }

    /**
     * GET /api/orders/my-orders
     * Returns all orders for the currently authenticated user
     */
    @GetMapping("/my-orders")
    public ResponseEntity<List<Order>> getMyOrders(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(orderService.getOrdersByUser(userDetails.getUsername()));
    }

    /**
     * GET /api/orders/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(orderService.getOrderById(id, userDetails.getUsername()));
    }

    /**
     * PUT /api/orders/{id}/cancel
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Order> cancelOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(orderService.cancelOrder(id, userDetails.getUsername()));
    }

    // ─── Admin endpoints ──────────────────────────────────────────────────────

    @GetMapping("/admin/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/admin/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }
}