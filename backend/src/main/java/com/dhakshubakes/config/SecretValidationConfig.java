package com.dhakshubakes.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Slf4j
@Component
@RequiredArgsConstructor
public class SecretValidationConfig {

    private final Environment environment;

    @PostConstruct
    public void validateSecretsOnStartup() {
        boolean isProd = Arrays.asList(environment.getActiveProfiles()).contains("prod");

        if (isProd) {
            log.info("Production profile detected. Validating mandatory environment secrets...");
            
            String jwtSecret = environment.getProperty("dhakshu.app.jwtSecret");
            String razorpayKeySecret = environment.getProperty("dhakshu.app.razorpayKeySecret");
            String razorpayWebhookSecret = environment.getProperty("dhakshu.app.razorpayWebhookSecret");
            String dbUrl = environment.getProperty("spring.datasource.url");

            if (jwtSecret == null || jwtSecret.isBlank() || jwtSecret.length() < 32 || jwtSecret.contains("placeholder")) {
                throw new IllegalStateException("FATAL: JWT_SECRET environment variable is missing, weak, or placeholder in production!");
            }

            if (razorpayKeySecret == null || razorpayKeySecret.isBlank() || razorpayKeySecret.contains("placeholder")) {
                throw new IllegalStateException("FATAL: RAZORPAY_KEY_SECRET environment variable is missing or placeholder in production!");
            }

            if (razorpayWebhookSecret == null || razorpayWebhookSecret.isBlank() || razorpayWebhookSecret.contains("placeholder")) {
                throw new IllegalStateException("FATAL: RAZORPAY_WEBHOOK_SECRET environment variable is missing or placeholder in production!");
            }

            if (dbUrl == null || dbUrl.isBlank()) {
                throw new IllegalStateException("FATAL: DATABASE_URL environment variable is missing in production!");
            }

            log.info("All production secrets successfully validated.");
        }
    }
}
