package com.dhakshubakes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

public class ProductDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long categoryId;
        private String categoryName;
        private String name;
        private String slug;
        private String description;
        private String ingredients;
        private String allergens;
        private String nutritionFacts;
        private String storageInstructions;
        private String deliveryInfo;
        private boolean isEggless;
        private boolean isFeatured;
        private boolean isBestseller;
        private boolean isSeasonal;
        private boolean isActive;
        private Double ratingAvg;
        private Integer reviewCount;
        private List<VariantResponse> variants;
        private List<ImageResponse> images;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VariantResponse {
        private Long id;
        private String sku;
        private String variantName;
        private BigDecimal price;
        private BigDecimal discountPrice;
        private Integer weightGrams;
        private Integer stockQuantity;
        private boolean outOfStock;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImageResponse {
        private Long id;
        private String imageUrl;
        private String altText;
        private boolean isPrimary;
        private Integer displayOrder;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotNull(message = "Category ID is required")
        private Long categoryId;
        @NotBlank(message = "Product name is required")
        private String name;
        private String description;
        private String ingredients;
        private String allergens;
        private String nutritionFacts;
        private String storageInstructions;
        private String deliveryInfo;
        private boolean isEggless;
        private boolean isFeatured;
        private boolean isBestseller;
        private boolean isSeasonal;
        private List<VariantRequest> variants;
        private List<String> imageUrls;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VariantRequest {
        private String sku;
        private String variantName;
        private BigDecimal price;
        private BigDecimal discountPrice;
        private Integer weightGrams;
        private Integer stockQuantity;
    }
}
