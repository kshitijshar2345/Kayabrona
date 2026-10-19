package com.ecommerce.backend.repository;

import com.ecommerce.backend.model.Order;
import com.ecommerce.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // BUG FIXED: Original Order entity had `String userId` not `User user`,
    // so this query couldn't work. Now that Order has @ManyToOne User, this works.
    List<Order> findByUserOrderByCreatedAtDesc(User user);

    List<Order> findAllByOrderByCreatedAtDesc();
}