package com.dhakshubakes.controller;

import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.dto.PaymentDTO;
import com.dhakshubakes.security.UserPrincipal;
import com.dhakshubakes.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-razorpay-order")
    public ResponseEntity<ApiResponse<PaymentDTO.RazorpayOrderResponse>> createRazorpayOrder(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody PaymentDTO.CreateRazorpayOrderRequest request) {
        return ResponseEntity.ok(paymentService.createRazorpayOrder(userPrincipal, request));
    }

    @PostMapping("/verify-razorpay")
    public ResponseEntity<ApiResponse<Boolean>> verifyPayment(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody PaymentDTO.VerifyPaymentRequest request) {
        return ResponseEntity.ok(paymentService.verifyPayment(userPrincipal, request));
    }

    @PostMapping("/webhook")
    public ResponseEntity<ApiResponse<Boolean>> handleRazorpayWebhook(
            @RequestHeader("X-Razorpay-Signature") String signature,
            @RequestBody String rawPayload) {
        return ResponseEntity.ok(paymentService.processRazorpayWebhook(rawPayload, signature));
    }
}
