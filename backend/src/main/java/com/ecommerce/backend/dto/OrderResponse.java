package com.ecommerce.backend.dto;

import com.ecommerce.backend.model.Order;
import com.ecommerce.backend.model.OrderItem;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

// BUG FIXED: Was calling order.getItems() — but Order entity uses getOrderItems().
// That mismatch caused "cannot find symbol: method getItems()" at lines 63 and 64.

public class OrderResponse {

    private Long id;
    private String orderId;
    private String status;
    private String paymentMethod;
    private Double totalAmount;
    private String shippingAddress;
    private String city;
    private String state;
    private String pincode;
    private String phone;
    private String createdAt;
    private List<ItemDto> items;

    public static class ItemDto {
        private Long productId;
        private String productName;
        private Double price;
        private Integer quantity;
        private String imageUrl;

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }

        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }

    public static OrderResponse from(Order order) {
        OrderResponse r = new OrderResponse();
        r.setId(order.getId());
        r.setOrderId(String.format("#ORD-%04d", order.getId()));
        r.setStatus(order.getStatus());
        r.setPaymentMethod(order.getPaymentMethod());
        r.setTotalAmount(order.getTotalAmount());
        r.setShippingAddress(order.getShippingAddress());
        r.setCity(order.getCity());
        r.setState(order.getState());
        r.setPincode(order.getPincode());
        r.setPhone(order.getPhone());

        if (order.getCreatedAt() != null) {
            r.setCreatedAt(order.getCreatedAt()
                    .format(DateTimeFormatter.ofPattern("dd MMM yyyy")));
        }

        List<ItemDto> dtos = new ArrayList<>();
        // FIX: was order.getItems() — now correctly order.getOrderItems()
        if (order.getOrderItems() != null) {
            for (OrderItem i : order.getOrderItems()) {
                ItemDto dto = new ItemDto();
                dto.setProductId(i.getProductId());
                dto.setProductName(i.getProductName());
                dto.setPrice(i.getPrice());
                dto.setQuantity(i.getQuantity());
                dto.setImageUrl(i.getImageUrl());
                dtos.add(dto);
            }
        }
        r.setItems(dtos);
        return r;
    }

    // ─── Getters & Setters ────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public List<ItemDto> getItems() { return items; }
    public void setItems(List<ItemDto> items) { this.items = items; }
}