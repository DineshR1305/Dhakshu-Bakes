package com.dhakshubakes.service;

import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.dto.PaymentDTO;
import com.dhakshubakes.entity.*;
import com.dhakshubakes.exception.BadRequestException;
import com.dhakshubakes.repository.CouponRepository;
import com.dhakshubakes.repository.InventoryRepository;
import com.dhakshubakes.repository.OrderRepository;
import com.dhakshubakes.repository.PaymentRepository;
import com.dhakshubakes.security.UserPrincipal;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final InventoryRepository inventoryRepository;
    private final CouponRepository couponRepository;
    private final CouponService couponService;
    private final ObjectMapper objectMapper;

    @Value("${dhakshu.app.razorpayKeyId}")
    private String razorpayKeyId;

    @Value("${dhakshu.app.razorpayKeySecret}")
    private String razorpayKeySecret;

    @Value("${dhakshu.app.razorpayWebhookSecret}")
    private String razorpayWebhookSecret;

    @Transactional
    public ApiResponse<PaymentDTO.RazorpayOrderResponse> createRazorpayOrder(UserPrincipal userPrincipal, PaymentDTO.CreateRazorpayOrderRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new BadRequestException("Order not found"));

        if (!order.getUser().getId().equals(userPrincipal.getId())) {
            return ApiResponse.error("Unauthorized access to order", "UNAUTHORIZED");
        }

        String razorpayOrderId = "order_rzp_" + System.currentTimeMillis();

        Payment payment = Payment.builder()
                .order(order)
                .razorpayOrderId(razorpayOrderId)
                .amount(order.getTotalAmount())
                .currency("INR")
                .status(PaymentStatus.PENDING)
                .build();

        paymentRepository.save(payment);
        order.setPayment(payment);
        orderRepository.save(order);

        PaymentDTO.RazorpayOrderResponse response = PaymentDTO.RazorpayOrderResponse.builder()
                .razorpayOrderId(razorpayOrderId)
                .keyId(razorpayKeyId)
                .amount(order.getTotalAmount().multiply(BigDecimal.valueOf(100))) // Convert to paise
                .currency("INR")
                .customerName(order.getUser().getFullName())
                .customerEmail(order.getUser().getEmail())
                .customerPhone(order.getUser().getPhone())
                .build();

        return ApiResponse.success("Razorpay order created", response);
    }

    @Transactional
    public ApiResponse<Boolean> verifyPayment(UserPrincipal userPrincipal, PaymentDTO.VerifyPaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new BadRequestException("Order not found"));

        // Idempotency check: if order is already paid, return success without re-processing
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            log.info("Order {} is already marked PAID. Idempotent check returning success.", order.getOrderNumber());
            return ApiResponse.success("Payment already verified", true);
        }

        // Verify Razorpay HMAC-SHA256 signature
        String payload = request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId();
        boolean isValidSignature = verifyHmacSha256(payload, request.getRazorpaySignature(), razorpayKeySecret);

        if (!isValidSignature) {
            log.error("Payment verification failed for order {}. Signature mismatch.", order.getOrderNumber());
            order.setPaymentStatus(PaymentStatus.FAILED);
            order.setOrderStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);
            return ApiResponse.error("Payment verification failed. Invalid signature.", "PAYMENT_FAILED");
        }

        // Process successful payment
        fulfillSuccessfulPayment(order, request.getRazorpayPaymentId(), request.getRazorpaySignature(), "Razorpay Online Modal");

        return ApiResponse.success("Payment verified successfully", true);
    }

    @Transactional
    public ApiResponse<Boolean> processRazorpayWebhook(String rawPayload, String signature) {
        if (signature == null || signature.isBlank()) {
            throw new BadRequestException("Missing Razorpay signature header");
        }

        boolean isValidSignature = verifyHmacSha256(rawPayload, signature, razorpayWebhookSecret);
        if (!isValidSignature) {
            log.error("Razorpay Webhook signature verification failed!");
            throw new BadRequestException("Invalid Razorpay Webhook signature");
        }

        try {
            JsonNode root = objectMapper.readTree(rawPayload);
            String event = root.path("event").asText();

            log.info("Processing Razorpay Webhook event: {}", event);

            if ("payment.captured".equalsIgnoreCase(event)) {
                JsonNode paymentEntity = root.path("payload").path("payment").path("entity");
                String razorpayOrderId = paymentEntity.path("order_id").asText();
                String razorpayPaymentId = paymentEntity.path("id").asText();
                String paymentMethod = paymentEntity.path("method").asText("Razorpay Webhook");

                Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId).orElse(null);
                if (payment == null) {
                    log.warn("Webhook received for unknown Razorpay Order ID: {}", razorpayOrderId);
                    return ApiResponse.success("Webhook processed (Order not found)", true);
                }

                Order order = payment.getOrder();
                if (order.getPaymentStatus() == PaymentStatus.PAID) {
                    log.info("Webhook idempotent check: Order {} is already PAID.", order.getOrderNumber());
                    return ApiResponse.success("Webhook processed (Already paid)", true);
                }

                fulfillSuccessfulPayment(order, razorpayPaymentId, signature, paymentMethod);
                return ApiResponse.success("Webhook payment.captured processed successfully", true);
            }

            return ApiResponse.success("Webhook event ignored: " + event, true);
        } catch (Exception e) {
            log.error("Error processing Razorpay webhook payload", e);
            throw new BadRequestException("Failed to parse webhook JSON payload");
        }
    }

    private void fulfillSuccessfulPayment(Order order, String paymentId, String signature, String paymentMethod) {
        Payment payment = order.getPayment();
        if (payment == null) {
            payment = Payment.builder().order(order).amount(order.getTotalAmount()).currency("INR").build();
        }

        payment.setRazorpayPaymentId(paymentId);
        payment.setRazorpaySignature(signature);
        payment.setStatus(PaymentStatus.PAID);
        payment.setPaymentMethod(paymentMethod);
        paymentRepository.save(payment);

        order.setPaymentStatus(PaymentStatus.PAID);
        order.setOrderStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        // 1. Deduct Inventory Stock
        for (OrderItem item : order.getItems()) {
            ProductVariant variant = item.getVariant();
            if (variant != null && variant.getInventory() != null) {
                Inventory inventory = variant.getInventory();
                int newStock = Math.max(0, inventory.getStockQuantity() - item.getQuantity());
                inventory.setStockQuantity(newStock);
                if (newStock <= 0) {
                    inventory.setOutOfStock(true);
                }
                inventoryRepository.save(inventory);
            }
        }

        // 2. Account for Coupon Usage if applied
        if (order.getAppliedCouponCode() != null && !order.getAppliedCouponCode().isBlank()) {
            Coupon coupon = couponRepository.findByCodeIgnoreCase(order.getAppliedCouponCode()).orElse(null);
            if (coupon != null) {
                couponService.recordCouponUsage(order.getUser(), coupon, order);
            }
        }
    }

    private boolean verifyHmacSha256(String data, String expectedSignature, String secret) {
        try {
            Mac sha256Hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256Hmac.init(secretKey);
            byte[] hash = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            String generatedSignature = HexFormat.of().formatHex(hash);
            return generatedSignature.equalsIgnoreCase(expectedSignature);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            log.error("HMAC SHA256 error during signature verification", e);
            return false;
        }
    }
}
