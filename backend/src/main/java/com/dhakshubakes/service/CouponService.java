package com.dhakshubakes.service;

import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.dto.CouponDTO;
import com.dhakshubakes.entity.Coupon;
import com.dhakshubakes.entity.CouponUsage;
import com.dhakshubakes.entity.Order;
import com.dhakshubakes.entity.User;
import com.dhakshubakes.repository.CouponRepository;
import com.dhakshubakes.repository.CouponUsageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;

    @Transactional(readOnly = true)
    public ApiResponse<CouponDTO.ValidationResponse> validateCoupon(CouponDTO.ValidateRequest request) {
        if (request.getCode() == null || request.getCode().trim().isEmpty()) {
            return ApiResponse.error("Coupon code cannot be empty", "INVALID_COUPON");
        }

        String code = request.getCode().trim();
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code).orElse(null);

        if (coupon == null || !coupon.isActive()) {
            return ApiResponse.success("Invalid or expired coupon code", CouponDTO.ValidationResponse.builder().valid(false).message("Invalid or inactive coupon code").build());
        }

        LocalDate today = LocalDate.now();
        if (coupon.getStartDate() != null && today.isBefore(coupon.getStartDate())) {
            return ApiResponse.success("Coupon is not active yet", CouponDTO.ValidationResponse.builder().valid(false).message("Coupon is not active yet").build());
        }

        if (coupon.getExpiryDate() != null && today.isAfter(coupon.getExpiryDate())) {
            return ApiResponse.success("Coupon has expired", CouponDTO.ValidationResponse.builder().valid(false).message("Coupon has expired").build());
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            return ApiResponse.success("Coupon usage limit reached", CouponDTO.ValidationResponse.builder().valid(false).message("Coupon usage limit reached").build());
        }

        BigDecimal subtotal = request.getOrderSubtotal() != null ? request.getOrderSubtotal() : BigDecimal.ZERO;
        if (coupon.getMinOrderAmount() != null && subtotal.compareTo(coupon.getMinOrderAmount()) < 0) {
            return ApiResponse.success("Subtotal does not meet minimum requirement",
                    CouponDTO.ValidationResponse.builder()
                            .valid(false)
                            .message("Minimum order amount of ₹" + coupon.getMinOrderAmount() + " required for this coupon")
                            .build());
        }

        BigDecimal calculatedDiscount = BigDecimal.ZERO;
        if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())) {
            calculatedDiscount = subtotal.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (coupon.getMaxDiscountAmount() != null && calculatedDiscount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                calculatedDiscount = coupon.getMaxDiscountAmount();
            }
        } else if ("FIXED".equalsIgnoreCase(coupon.getDiscountType())) {
            calculatedDiscount = coupon.getDiscountValue();
            if (calculatedDiscount.compareTo(subtotal) > 0) {
                calculatedDiscount = subtotal;
            }
        }

        CouponDTO.ValidationResponse response = CouponDTO.ValidationResponse.builder()
                .valid(true)
                .code(coupon.getCode())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .calculatedDiscount(calculatedDiscount)
                .message("Coupon applied successfully! You saved ₹" + calculatedDiscount)
                .build();

        return ApiResponse.success("Coupon validated", response);
    }

    @Transactional
    public void recordCouponUsage(User user, Coupon coupon, Order order) {
        if (user == null || coupon == null || order == null) return;

        boolean alreadyRecorded = couponUsageRepository.existsByOrderIdAndCouponId(order.getId(), coupon.getId());
        if (alreadyRecorded) {
            log.info("Coupon usage already recorded for order: {}", order.getOrderNumber());
            return;
        }

        // Increment usage count
        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);

        // Record audit trail
        CouponUsage usage = CouponUsage.builder()
                .user(user)
                .coupon(coupon)
                .order(order)
                .build();
        couponUsageRepository.save(usage);
        log.info("Successfully recorded coupon usage for code: {} on order: {}", coupon.getCode(), order.getOrderNumber());
    }

    public BigDecimal calculateCouponDiscount(String code, BigDecimal subtotal) {
        if (code == null || code.isBlank() || subtotal == null) return BigDecimal.ZERO;
        ApiResponse<CouponDTO.ValidationResponse> val = validateCoupon(new CouponDTO.ValidateRequest(code, subtotal));
        if (val.isSuccess() && val.getData() != null && val.getData().isValid()) {
            return val.getData().getCalculatedDiscount();
        }
        return BigDecimal.ZERO;
    }
}
