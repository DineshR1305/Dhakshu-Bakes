package com.dhakshubakes.security;

import com.dhakshubakes.dto.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitingFilter extends OncePerRequestFilter {

    private final RateLimitingService rateLimitingService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Target authentication sensitive endpoints: login & register
        if ("POST".equalsIgnoreCase(method) && (path.endsWith("/auth/login") || path.endsWith("/auth/register"))) {
            String clientKey = resolveClientKey(request);

            if (!rateLimitingService.isAllowed(clientKey)) {
                log.warn("Rate limit exceeded for client key: {}", clientKey);
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);

                ApiResponse<Object> errorResponse = ApiResponse.error(
                        "Too many authentication attempts. Please wait 1 minute before trying again.",
                        "RATE_LIMIT_EXCEEDED"
                );
                objectMapper.writeValue(response.getOutputStream(), errorResponse);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Resolves client identifier. Currently uses Client IP address (with X-Forwarded-For support).
     * Modular design allows extension to IP + Account/Email identifier in future stages.
     */
    private String resolveClientKey(HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            ip = xForwardedFor.split(",")[0].trim();
        }
        return ip + ":" + request.getRequestURI();
    }
}
