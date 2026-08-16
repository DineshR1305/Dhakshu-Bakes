package com.dhakshubakes.controller;

import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.entity.ContactInquiry;
import com.dhakshubakes.repository.ContactInquiryRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/contact")
@RequiredArgsConstructor
public class ContactController {

    private final ContactInquiryRepository contactInquiryRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<ContactInquiry>> submitContact(@Valid @RequestBody ContactInquiry inquiry) {
        ContactInquiry saved = contactInquiryRepository.save(inquiry);
        return ResponseEntity.ok(ApiResponse.success("Thank you for reaching out! We have received your message.", saved));
    }
}
