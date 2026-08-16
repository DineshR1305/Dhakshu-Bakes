package com.dhakshubakes.dto;

import com.dhakshubakes.entity.OrderStatus;
import com.dhakshubakes.entity.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CheckoutRequest {
        @NotNull(message = "Shipping address ID is required")
        private Long shippingAddressId;

        private String couponCode;
        private LocalDate deliveryDate;
        private String deliveryTimeSlot;
        private boolean isGift;
        private String giftMessage;
        private String recipientName;
        private String recipientPhone;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String orderNumber;
        private String customerName;
        private String customerEmail;
        private AddressDTO shippingAddress;
        private BigDecimal subtotal;
        private BigDecimal discountAmount;
        private BigDecimal deliveryFee;
        private BigDecimal taxAmount;
        private BigDecimal totalAmount;
        private OrderStatus orderStatus;
        private PaymentStatus paymentStatus;
        private LocalDate deliveryDate;
        private String deliveryTimeSlot;
        private String appliedCouponCode;
        private boolean isGift;
        private String giftMessage;
        private String recipientName;
        private String razorpayOrderId;
        private List<ItemResponse> items;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String productSlug;
        private Long variantId;
        private String variantName;
        private BigDecimal unitPrice;
        private Integer quantity;
        private BigDecimal totalPrice;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddressDTO {
        private String fullName;
        private String phone;
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String state;
        private String postalCode;
        private String country;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusUpdateRequest {
        private OrderStatus status;
    }
}
