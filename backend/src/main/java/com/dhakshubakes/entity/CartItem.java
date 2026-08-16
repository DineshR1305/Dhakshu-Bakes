package com.dhakshubakes.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "cart_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    @JsonIgnore
    private Cart cart;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @Min(1)
    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "custom_message", length = 200)
    private String customMessage;

    @Column(name = "special_instructions", length = 500)
    private String specialInstructions;

    @Builder.Default
    @Column(name = "is_eggless", nullable = false)
    private boolean isEggless = false;

    @Builder.Default
    @Column(name = "is_gift_wrapped", nullable = false)
    private boolean isGiftWrapped = false;

    @Builder.Default
    @Column(name = "customization_fee", nullable = false)
    private BigDecimal customizationFee = BigDecimal.ZERO;
}
