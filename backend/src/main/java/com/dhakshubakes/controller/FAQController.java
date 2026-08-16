package com.dhakshubakes.controller;

import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.entity.FAQ;
import com.dhakshubakes.repository.FAQRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/faqs")
@RequiredArgsConstructor
public class FAQController {

    private final FAQRepository faqRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FAQ>>> getFAQs(@RequestParam(required = false) String category) {
        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success("FAQs fetched", faqRepository.findByCategoryOrderByDisplayOrderAsc(category)));
        }
        return ResponseEntity.ok(ApiResponse.success("FAQs fetched", faqRepository.findAllByOrderByDisplayOrderAsc()));
    }
}
