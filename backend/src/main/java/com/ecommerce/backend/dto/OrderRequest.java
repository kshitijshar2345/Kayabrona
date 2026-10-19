package com.ecommerce.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderRequest {

    private String shippingAddress;
    private String phoneNumber;
    private String paymentMethod; // "COD" or "ONLINE"
    private List<OrderItemRequest> items;

    @Data
    public static class OrderItemRequest {
        private Long productId;
        private int quantity;
    }
}