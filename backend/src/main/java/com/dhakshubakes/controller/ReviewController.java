package com.dhakshubakes.controller;

import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.dto.ReviewDTO;
import com.dhakshubakes.security.UserPrincipal;
import com.dhakshubakes.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<ReviewDTO.Response>>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }

    @GetMapping("/product/{productId}/summary")
    public ResponseEntity<ApiResponse<ReviewDTO.RatingSummaryResponse>> getRatingSummary(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getRatingSummary(productId));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewDTO.Response>> addReview(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ReviewDTO.CreateRequest request) {
        return ResponseEntity.ok(reviewService.addReview(userPrincipal, request));
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<ReviewDTO.Response>> updateReview(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewDTO.CreateRequest request) {
        return ResponseEntity.ok(reviewService.updateReview(userPrincipal, reviewId, request));
    }

    @PostMapping("/{reviewId}/helpful")
    public ResponseEntity<ApiResponse<ReviewDTO.Response>> markHelpful(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long reviewId) {
        return ResponseEntity.ok(reviewService.markHelpful(userPrincipal, reviewId));
    }
}
