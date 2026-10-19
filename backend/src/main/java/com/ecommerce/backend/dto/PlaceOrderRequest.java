package com.ecommerce.backend.dto;

import java.util.List;

// This is the CORRECT DTO to use for POST /api/orders.
// It matches exactly what Cart.jsx sends from the frontend.
// BUG FIX: Your project had BOTH OrderRequest and PlaceOrderRequest
// causing a mismatch. OrderController now uses this one only.

public class PlaceOrderRequest {

    private String shippingAddress;
    private String city;
    private String state;
    private String pincode;
    private String phone;
    private String paymentMethod; // "COD" or "ONLINE"
    private Double totalAmount;
    private List<OrderItemDto> items;

    // Inner DTO — cart items already have name/price/image resolved on client side
    public static class OrderItemDto {
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

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public List<OrderItemDto> getItems() { return items; }
    public void setItems(List<OrderItemDto> items) { this.items = items; }
}