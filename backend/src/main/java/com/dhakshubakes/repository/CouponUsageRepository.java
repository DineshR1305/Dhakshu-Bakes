package com.dhakshubakes.repository;

import com.dhakshubakes.entity.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {
    long countByUserIdAndCouponId(Long userId, Long couponId);
    boolean existsByOrderIdAndCouponId(Long orderId, Long couponId);
}
