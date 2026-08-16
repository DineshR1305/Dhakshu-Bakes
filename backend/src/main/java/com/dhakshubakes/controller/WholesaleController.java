package com.dhakshubakes.controller;

import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.entity.WholesaleInquiry;
import com.dhakshubakes.repository.WholesaleInquiryRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/wholesale")
@RequiredArgsConstructor
public class WholesaleController {

    private final WholesaleInquiryRepository wholesaleInquiryRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<WholesaleInquiry>> submitInquiry(@Valid @RequestBody WholesaleInquiry inquiry) {
        inquiry.setStatus("PENDING");
        WholesaleInquiry saved = wholesaleInquiryRepository.save(inquiry);
        return ResponseEntity.ok(ApiResponse.success("Wholesale inquiry submitted successfully. Our team will contact you shortly.", saved));
    }
}
