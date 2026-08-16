package com.dhakshubakes.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    @JsonIgnoreProperties("products")
    private Category category;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @NotBlank
    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String ingredients;

    @Column(columnDefinition = "TEXT")
    private String allergens;

    @Column(name = "nutrition_facts", columnDefinition = "TEXT")
    private String nutritionFacts;

    @Column(name = "storage_instructions", columnDefinition = "TEXT")
    private String storageInstructions;

    @Column(name = "delivery_info", columnDefinition = "TEXT")
    private String deliveryInfo;

    @Builder.Default
    @Column(name = "is_eggless", nullable = false)
    private boolean isEggless = false;

    @Builder.Default
    @Column(name = "is_featured", nullable = false)
    private boolean isFeatured = false;

    @Builder.Default
    @Column(name = "is_bestseller", nullable = false)
    private boolean isBestseller = false;

    @Builder.Default
    @Column(name = "is_seasonal", nullable = false)
    private boolean isSeasonal = false;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Builder.Default
    @Column(name = "rating_avg")
    private Double ratingAvg = 5.0;

    @Builder.Default
    @Column(name = "review_count")
    private Integer reviewCount = 0;

    // Customization Capabilities
    @Builder.Default
    @Column(name = "custom_message_allowed", nullable = false)
    private boolean customMessageAllowed = true;

    @Builder.Default
    @Column(name = "special_instructions_allowed", nullable = false)
    private boolean specialInstructionsAllowed = true;

    @Builder.Default
    @Column(name = "eggless_allowed", nullable = false)
    private boolean egglessAllowed = true;

    @Builder.Default
    @Column(name = "gift_wrap_allowed", nullable = false)
    private boolean giftWrapAllowed = true;

    @Builder.Default
    @Column(name = "eggless_surcharge", nullable = false)
    private BigDecimal egglessSurcharge = new BigDecimal("50.00");

    @Builder.Default
    @Column(name = "gift_wrap_fee", nullable = false)
    private BigDecimal giftWrapFee = new BigDecimal("30.00");

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<ProductVariant> variants = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();
}
