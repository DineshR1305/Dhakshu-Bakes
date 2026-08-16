package com.dhakshubakes.service;

import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.dto.CouponDTO;
import com.dhakshubakes.entity.Coupon;
import com.dhakshubakes.entity.CouponUsage;
import com.dhakshubakes.entity.Order;
import com.dhakshubakes.entity.User;
import com.dhakshubakes.exception.ResourceNotFoundException;
import com.dhakshubakes.repository.CouponRepository;
import com.dhakshubakes.repository.CouponUsageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;

    @Transactional(readOnly = true)
    public ApiResponse<List<Coupon>> getActiveCoupons() {
        LocalDate today = LocalDate.now();
        List<Coupon> active = couponRepository.findByIsActiveTrue().stream()
                .filter(c -> c.getStartDate() == null || !today.isBefore(c.getStartDate()))
                .filter(c -> c.getExpiryDate() == null || !today.isAfter(c.getExpiryDate()))
                .filter(c -> c.getUsageLimit() == null || c.getUsedCount() < c.getUsageLimit())
                .collect(Collectors.toList());
        return ApiResponse.success("Active coupons fetched", active);
    }

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

    @Transactional
    public ApiResponse<Coupon> updateCoupon(Long id, Coupon request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with ID: " + id));

        coupon.setCode(request.getCode().trim().toUpperCase());
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinOrderAmount(request.getMinOrderAmount());
        coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        coupon.setStartDate(request.getStartDate());
        coupon.setExpiryDate(request.getExpiryDate());
        coupon.setUsageLimit(request.getUsageLimit());
        coupon.setActive(request.isActive());

        Coupon saved = couponRepository.save(coupon);
        return ApiResponse.success("Coupon updated successfully", saved);
    }

    @Transactional
    public ApiResponse<Void> deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with ID: " + id));
        couponRepository.delete(coupon);
        return ApiResponse.success("Coupon deleted successfully", null);
    }
}
