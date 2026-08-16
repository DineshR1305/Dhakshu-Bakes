package com.dhakshubakes.repository;

import com.dhakshubakes.entity.Order;
import com.dhakshubakes.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Order> findByOrderStatusOrderByCreatedAtDesc(OrderStatus orderStatus);
    List<Order> findAllByOrderByCreatedAtDesc();

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.paymentStatus = com.dhakshubakes.entity.PaymentStatus.PAID")
    BigDecimal calculateTotalRevenue();

    Long countByOrderStatus(OrderStatus orderStatus);
    boolean existsByUserIdAndItemsProductIdAndOrderStatus(Long userId, Long productId, OrderStatus orderStatus);
}
