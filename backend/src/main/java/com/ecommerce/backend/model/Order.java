package com.ecommerce.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

// BUG FIXED: Original had `private String userId` — this broke OrderService
// which called order.setUser(user), and OrderRepository which queries by User object.
// FIX: Proper @ManyToOne relationship to User entity.

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FIX: Was `private String userId` — now proper JPA relationship
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "hibernateLazyInitializer"})
    private User user;

    @Column(nullable = false)
    private Double totalAmount;

    @Column(nullable = false)
    private String status = "PENDING";

    private String paymentStatus = "UNPAID";

    @Column(nullable = false)
    private String paymentMethod;

    @Column(nullable = false, length = 1000)
    private String shippingAddress;

    // FIX: Added these fields to match PlaceOrderRequest DTO from frontend
    private String city;
    private String state;
    private String pincode;
    private String phone;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // FIX: Was `getItems()` but OrderService used `getOrderItems()`.
    // Standardized to `orderItems` throughout.
    // BUG FIXED: Missing @JsonIgnore on OrderItem.order caused infinite recursion.
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<OrderItem> orderItems;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = "PENDING";
        if (this.paymentStatus == null) this.paymentStatus = "UNPAID";
    }

    // ─── Getters & Setters ────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<OrderItem> getOrderItems() { return orderItems; }
    public void setOrderItems(List<OrderItem> orderItems) { this.orderItems = orderItems; }
}