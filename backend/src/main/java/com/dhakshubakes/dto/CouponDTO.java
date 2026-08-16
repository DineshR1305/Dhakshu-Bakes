package com.dhakshubakes.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

public class CouponDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ValidateRequest {
        @NotBlank(message = "Coupon code is required")
        private String code;

        private BigDecimal orderSubtotal;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ValidationResponse {
        private boolean valid;
        private String code;
        private String discountType; // PERCENTAGE or FIXED
        private BigDecimal discountValue;
        private BigDecimal calculatedDiscount;
        private String message;
    }
}
