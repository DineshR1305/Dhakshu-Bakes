package com.dhakshubakes.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "stores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(nullable = false)
    private String phone;

    @Column(name = "opening_hours")
    private String openingHours;

    private Double latitude;

    private Double longitude;

    private String services;

    @Builder.Default
    @Column(name = "has_pickup", nullable = false)
    private boolean hasPickup = true;
}
