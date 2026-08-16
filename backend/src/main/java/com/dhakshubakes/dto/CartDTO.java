package com.dhakshubakes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

public class CartDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private List<ItemResponse> items;
        private BigDecimal subtotal;
        private Integer itemCount;
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
        private String productImage;
        private Long variantId;
        private String variantName;
        private BigDecimal unitPrice;
        private Integer quantity;
        private BigDecimal totalPrice;
        private String customMessage;
        private String specialInstructions;
        private boolean isEggless;
        private boolean isGiftWrapped;
        private BigDecimal customizationFee;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AddRequest {
        private Long productId;
        private Long variantId;
        private Integer quantity;
        private String customMessage;
        private String specialInstructions;
        private Boolean isEggless;
        private Boolean isGiftWrapped;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private Integer quantity;
    }
}
