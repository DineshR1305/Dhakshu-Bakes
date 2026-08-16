package com.dhakshubakes.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "delivery_pincodes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryPincode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String pincode;

    @Column(name = "area_name", nullable = false)
    private String areaName;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "min_order_for_free_delivery", nullable = false)
    @Builder.Default
    private BigDecimal minOrderForFreeDelivery = new BigDecimal("499.00");
}
