package com.dhakshubakes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class DeliveryDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SlotResponse {
        private Long id;
        private String slotName;
        private String startTime;
        private String endTime;
        private Integer maxCapacity;
        private Integer bookedCount;
        private Integer remainingCapacity;
        private BigDecimal extraFee;
        private boolean available;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ServiceabilityCheckRequest {
        private String pincode;
        private BigDecimal subtotal;
        private String deliveryType; // STANDARD, EXPRESS, SAME_DAY
        private String deliveryDate; // YYYY-MM-DD
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ServiceabilityResponse {
        private boolean serviceable;
        private String pincode;
        private String areaName;
        private BigDecimal deliveryFee;
        private boolean freeDelivery;
        private String message;
    }
}
