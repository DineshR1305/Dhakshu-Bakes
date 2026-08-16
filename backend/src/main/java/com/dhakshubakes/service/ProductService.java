package com.dhakshubakes.service;

import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.dto.ProductDTO;
import com.dhakshubakes.entity.Category;
import com.dhakshubakes.entity.Inventory;
import com.dhakshubakes.entity.Product;
import com.dhakshubakes.entity.ProductImage;
import com.dhakshubakes.entity.ProductVariant;
import com.dhakshubakes.exception.ResourceNotFoundException;
import com.dhakshubakes.repository.CategoryRepository;
import com.dhakshubakes.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public ApiResponse<List<ProductDTO.Response>> searchAndFilterProducts(
            String query, String categorySlug, Boolean isEggless, Boolean isFeatured,
            Boolean isBestseller, String sortBy, Double minPrice, Double maxPrice) {

        List<Product> products = productRepository.searchProducts(
                (query != null && !query.trim().isEmpty()) ? query.trim() : null,
                (categorySlug != null && !categorySlug.trim().isEmpty()) ? categorySlug.trim() : null,
                isEggless, isFeatured, isBestseller
        );

        List<ProductDTO.Response> responses = products.stream()
                .map(this::mapToResponse)
                .filter(p -> {
                    if (minPrice != null || maxPrice != null) {
                        double price = p.getVariants().isEmpty() ? 0.0 : p.getVariants().get(0).getPrice().doubleValue();
                        if (minPrice != null && price < minPrice) return false;
                        if (maxPrice != null && price > maxPrice) return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());

        if (sortBy != null) {
            switch (sortBy.toLowerCase()) {
                case "price-asc":
                    responses.sort((p1, p2) -> {
                        java.math.BigDecimal v1 = p1.getVariants().isEmpty() ? java.math.BigDecimal.ZERO : p1.getVariants().get(0).getPrice();
                        java.math.BigDecimal v2 = p2.getVariants().isEmpty() ? java.math.BigDecimal.ZERO : p2.getVariants().get(0).getPrice();
                        return v1.compareTo(v2);
                    });
                    break;
                case "price-desc":
                    responses.sort((p1, p2) -> {
                        java.math.BigDecimal v1 = p1.getVariants().isEmpty() ? java.math.BigDecimal.ZERO : p1.getVariants().get(0).getPrice();
                        java.math.BigDecimal v2 = p2.getVariants().isEmpty() ? java.math.BigDecimal.ZERO : p2.getVariants().get(0).getPrice();
                        return v2.compareTo(v1);
                    });
                    break;
                case "rating":
                    responses.sort((p1, p2) -> Double.compare(p2.getRatingAvg(), p1.getRatingAvg()));
                    break;
                case "newest":
                    responses.sort((p1, p2) -> Long.compare(p2.getId(), p1.getId()));
                    break;
            }
        }

        return ApiResponse.success("Products retrieved successfully", responses);
    }

    @Transactional(readOnly = true)
    public ApiResponse<ProductDTO.Response> getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with slug: " + slug));
        return ApiResponse.success("Product fetched successfully", mapToResponse(product));
    }

    @Transactional(readOnly = true)
    public ApiResponse<List<ProductDTO.Response>> getFeaturedProducts() {
        List<ProductDTO.Response> featured = productRepository.findByIsFeaturedTrueAndIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ApiResponse.success("Featured products retrieved", featured);
    }

    @Transactional(readOnly = true)
    public ApiResponse<List<ProductDTO.Response>> getBestsellerProducts() {
        List<ProductDTO.Response> bestsellers = productRepository.findByIsBestsellerTrueAndIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ApiResponse.success("Bestsellers retrieved", bestsellers);
    }

    @Transactional(readOnly = true)
    public ApiResponse<List<ProductDTO.Response>> getSeasonalProducts() {
        List<ProductDTO.Response> seasonal = productRepository.findByIsSeasonalTrueAndIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ApiResponse.success("Seasonal products retrieved", seasonal);
    }

    public ProductDTO.Response mapToResponse(Product product) {
        List<ProductDTO.VariantResponse> variants = product.getVariants().stream()
                .map(v -> ProductDTO.VariantResponse.builder()
                        .id(v.getId())
                        .sku(v.getSku())
                        .variantName(v.getVariantName())
                        .price(v.getPrice())
                        .discountPrice(v.getDiscountPrice())
                        .weightGrams(v.getWeightGrams())
                        .stockQuantity(v.getInventory() != null ? v.getInventory().getStockQuantity() : 0)
                        .outOfStock(v.getInventory() != null && v.getInventory().isOutOfStock())
                        .build())
                .collect(Collectors.toList());

        List<ProductDTO.ImageResponse> images = product.getImages().stream()
                .map(img -> ProductDTO.ImageResponse.builder()
                        .id(img.getId())
                        .imageUrl(img.getImageUrl())
                        .altText(img.getAltText())
                        .isPrimary(img.isPrimary())
                        .displayOrder(img.getDisplayOrder())
                        .build())
                .collect(Collectors.toList());

        return ProductDTO.Response.builder()
                .id(product.getId())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .ingredients(product.getIngredients())
                .allergens(product.getAllergens())
                .nutritionFacts(product.getNutritionFacts())
                .storageInstructions(product.getStorageInstructions())
                .deliveryInfo(product.getDeliveryInfo())
                .isEggless(product.isEggless())
                .isFeatured(product.isFeatured())
                .isBestseller(product.isBestseller())
                .isSeasonal(product.isSeasonal())
                .isActive(product.isActive())
                .ratingAvg(product.getRatingAvg())
                .reviewCount(product.getReviewCount())
                .customMessageAllowed(product.isCustomMessageAllowed())
                .specialInstructionsAllowed(product.isSpecialInstructionsAllowed())
                .egglessAllowed(product.isEgglessAllowed())
                .giftWrapAllowed(product.isGiftWrapAllowed())
                .egglessSurcharge(product.getEgglessSurcharge())
                .giftWrapFee(product.getGiftWrapFee())
                .variants(variants)
                .images(images)
                .build();
    }
}
