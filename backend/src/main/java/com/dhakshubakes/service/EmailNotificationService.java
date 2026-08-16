package com.dhakshubakes.service;

import com.dhakshubakes.entity.Order;
import com.dhakshubakes.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailNotificationService {

    @Value("${spring.mail.enabled:false}")
    private boolean mailEnabled;

    public void sendOrderConfirmation(Order order) {
        if (!mailEnabled) {
            log.info("[MAIL DISABLED] Simulated Order Confirmation Email for order #: {} to {}", order.getOrderNumber(), order.getUser().getEmail());
            return;
        }

        try {
            log.info("Sending Order Confirmation Email for order #: {} to {}", order.getOrderNumber(), order.getUser().getEmail());
            // Real MailSender execution when mail.enabled=true
        } catch (Exception e) {
            log.error("Failed to send order confirmation email", e);
        }
    }

    public void sendOrderStatusUpdate(Order order) {
        if (!mailEnabled) {
            log.info("[MAIL DISABLED] Simulated Order Status Update Email ({}) for order #: {} to {}", order.getOrderStatus(), order.getOrderNumber(), order.getUser().getEmail());
            return;
        }

        try {
            log.info("Sending Order Status Update Email ({}) for order #: {} to {}", order.getOrderStatus(), order.getOrderNumber(), order.getUser().getEmail());
        } catch (Exception e) {
            log.error("Failed to send order status update email", e);
        }
    }

    public void sendPasswordResetToken(User user, String token) {
        if (!mailEnabled) {
            log.info("[MAIL DISABLED] Simulated Password Reset Email for user: {} with token: {}", user.getEmail(), token);
            return;
        }

        try {
            log.info("Sending Password Reset Email for user: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send password reset email", e);
        }
    }
}
