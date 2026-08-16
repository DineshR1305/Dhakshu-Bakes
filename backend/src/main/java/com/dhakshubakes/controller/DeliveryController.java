package com.dhakshubakes.controller;

import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.dto.DeliveryDTO;
import com.dhakshubakes.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/delivery")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @GetMapping("/slots")
    public ResponseEntity<ApiResponse<List<DeliveryDTO.SlotResponse>>> getAvailableSlots(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(deliveryService.getAvailableSlots(date));
    }

    @PostMapping("/check-serviceability")
    public ResponseEntity<ApiResponse<DeliveryDTO.ServiceabilityResponse>> checkServiceability(
            @RequestBody DeliveryDTO.ServiceabilityCheckRequest request) {
        return ResponseEntity.ok(deliveryService.checkServiceability(request));
    }
}
