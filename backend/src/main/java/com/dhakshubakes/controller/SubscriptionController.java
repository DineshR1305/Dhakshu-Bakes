package com.dhakshubakes.controller;

import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.entity.Product;
import com.dhakshubakes.entity.ProductVariant;
import com.dhakshubakes.entity.Subscription;
import com.dhakshubakes.entity.User;
import com.dhakshubakes.repository.ProductRepository;
import com.dhakshubakes.repository.ProductVariantRepository;
import com.dhakshubakes.repository.SubscriptionRepository;
import com.dhakshubakes.repository.UserRepository;
import com.dhakshubakes.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionRepository subscriptionRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Subscription>>> getMySubscriptions(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(ApiResponse.success("Subscriptions fetched", subscriptionRepository.findByUserId(userPrincipal.getId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Subscription>> createSubscription(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, Object> body) {
        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();
        Long productId = Long.valueOf(body.get("productId").toString());
        Long variantId = Long.valueOf(body.get("variantId").toString());
        Integer quantity = Integer.valueOf(body.getOrDefault("quantity", "1").toString());
        String frequency = body.getOrDefault("frequency", "WEEKLY").toString();

        Product product = productRepository.findById(productId).orElseThrow();
        ProductVariant variant = variantRepository.findById(variantId).orElseThrow();

        Subscription sub = Subscription.builder()
                .user(user)
                .product(product)
                .variant(variant)
                .quantity(quantity)
                .frequency(frequency)
                .status("ACTIVE")
                .nextDeliveryDate(LocalDate.now().plusDays(7))
                .build();

        return ResponseEntity.ok(ApiResponse.success("Subscription created successfully", subscriptionRepository.save(sub)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Subscription>> updateStatus(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Subscription sub = subscriptionRepository.findById(id).orElseThrow();
        if (!sub.getUser().getId().equals(userPrincipal.getId())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Unauthorized", "UNAUTHORIZED"));
        }
        String status = body.get("status"); // ACTIVE, PAUSED, CANCELLED
        sub.setStatus(status);
        return ResponseEntity.ok(ApiResponse.success("Subscription status updated to " + status, subscriptionRepository.save(sub)));
    }
}
