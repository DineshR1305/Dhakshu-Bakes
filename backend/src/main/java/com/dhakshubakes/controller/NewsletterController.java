package com.dhakshubakes.controller;

import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.entity.NewsletterSubscriber;
import com.dhakshubakes.repository.NewsletterSubscriberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/newsletter")
@RequiredArgsConstructor
public class NewsletterController {

    private final NewsletterSubscriberRepository newsletterSubscriberRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<Boolean>> subscribe(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (email == null || !email.contains("@")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Valid email is required", "INVALID_EMAIL"));
        }

        if (!newsletterSubscriberRepository.existsByEmailIgnoreCase(email)) {
            NewsletterSubscriber sub = NewsletterSubscriber.builder()
                    .email(email.toLowerCase().trim())
                    .isActive(true)
                    .build();
            newsletterSubscriberRepository.save(sub);
        }

        return ResponseEntity.ok(ApiResponse.success("Successfully subscribed to Dhakshu Bakes newsletter!", true));
    }
}
