package com.dhakshubakes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

public class PaymentDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRazorpayOrderRequest {
        @NotNull(message = "Order ID is required")
        private Long orderId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RazorpayOrderResponse {
        private String razorpayOrderId;
        private String keyId;
        private BigDecimal amount;
        private String currency;
        private String customerName;
        private String customerEmail;
        private String customerPhone;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerifyPaymentRequest {
        @NotNull(message = "Order ID is required")
        private Long orderId;

        @NotBlank(message = "Razorpay order ID is required")
        private String razorpayOrderId;

        @NotBlank(message = "Razorpay payment ID is required")
        private String razorpayPaymentId;

        @NotBlank(message = "Razorpay signature is required")
        private String razorpaySignature;
    }
}
