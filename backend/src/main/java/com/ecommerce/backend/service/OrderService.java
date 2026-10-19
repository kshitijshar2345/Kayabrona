package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.PlaceOrderRequest;
import com.ecommerce.backend.model.Order;
import com.ecommerce.backend.model.OrderItem;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.repository.OrderRepository;
import com.ecommerce.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    // BUG FIXED: Original used OrderRequest DTO (with productId/quantity only)
    // but frontend Cart.jsx sends PlaceOrderRequest (with full item details including
    // productName, price, imageUrl already resolved on client side).
    // FIX: Use PlaceOrderRequest everywhere, which already has all item details.
    // This avoids a second DB lookup for every cart item and matches the frontend payload.

    @Transactional
    public Order placeOrder(String userEmail, PlaceOrderRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(request.getShippingAddress());
        order.setCity(request.getCity());
        order.setState(request.getState());
        order.setPincode(request.getPincode());
        order.setPhone(request.getPhone());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setTotalAmount(request.getTotalAmount());
        order.setStatus("PENDING");
        order.setPaymentStatus("UNPAID");

        List<OrderItem> orderItems = new ArrayList<>();
        if (request.getItems() != null) {
            for (PlaceOrderRequest.OrderItemDto itemDto : request.getItems()) {
                OrderItem item = new OrderItem();
                item.setOrder(order);
                item.setProductId(itemDto.getProductId());
                item.setProductName(itemDto.getProductName());
                item.setPrice(itemDto.getPrice());
                item.setQuantity(itemDto.getQuantity());
                item.setImageUrl(itemDto.getImageUrl());
                orderItems.add(item);
            }
        }

        order.setOrderItems(orderItems);
        return orderRepository.save(order);
    }

    public List<Order> getOrdersByUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));
        return orderRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public Order getOrderById(Long id, String userEmail) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        if (!order.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Access denied");
        }
        return order;
    }

    @Transactional
    public Order cancelOrder(Long id, String userEmail) {
        Order order = getOrderById(id, userEmail);
        if (!"PENDING".equals(order.getStatus())) {
            throw new RuntimeException("Only PENDING orders can be cancelled");
        }
        order.setStatus("CANCELLED");
        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Order updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        order.setStatus(status);
        return orderRepository.save(order);
    }
}