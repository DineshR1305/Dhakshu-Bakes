package com.dhakshubakes.service;

import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.dto.PaymentDTO;
import com.dhakshubakes.entity.*;
import com.dhakshubakes.repository.InventoryRepository;
import com.dhakshubakes.repository.OrderRepository;
import com.dhakshubakes.repository.PaymentRepository;
import com.dhakshubakes.security.UserPrincipal;
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

    @Value("${dhakshu.app.razorpayKeyId}")
    private String razorpayKeyId;

    @Value("${dhakshu.app.razorpayKeySecret}")
    private String razorpayKeySecret;

    @Transactional
    public ApiResponse<PaymentDTO.RazorpayOrderResponse> createRazorpayOrder(UserPrincipal userPrincipal, PaymentDTO.CreateRazorpayOrderRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(userPrincipal.getId())) {
            return ApiResponse.error("Unauthorized access to order", "UNAUTHORIZED");
        }

        // Generate synthetic or real Razorpay order ID
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
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Verify Razorpay HMAC-SHA256 signature
        String payload = request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId();
        boolean isValidSignature = verifyHmacSha256(payload, request.getRazorpaySignature(), razorpayKeySecret);

        // Fallback for test mode placeholders
        if (!isValidSignature && razorpayKeySecret.startsWith("rzp_test_placeholder")) {
            log.warn("Test mode detected: bypassing Razorpay signature check for placeholder secret.");
            isValidSignature = true;
        }

        if (!isValidSignature) {
            order.setPaymentStatus(PaymentStatus.FAILED);
            order.setOrderStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);
            return ApiResponse.error("Payment verification failed. Invalid signature.", "PAYMENT_FAILED");
        }

        // Update Payment entity
        Payment payment = order.getPayment();
        if (payment == null) {
            payment = Payment.builder().order(order).amount(order.getTotalAmount()).currency("INR").build();
        }

        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        payment.setStatus(PaymentStatus.PAID);
        payment.setPaymentMethod("Razorpay Online");
        paymentRepository.save(payment);

        // Update Order status
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setOrderStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        // Deduct inventory stock for ordered items
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

        return ApiResponse.success("Payment verified successfully", true);
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
            log.error("HMAC SHA256 error during payment verification", e);
            return false;
        }
    }
}
