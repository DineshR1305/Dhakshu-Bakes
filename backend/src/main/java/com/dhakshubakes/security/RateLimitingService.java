package com.dhakshubakes.security;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitingService {

    private static final int MAX_REQUESTS_PER_MINUTE = 5;
    private static final long WINDOW_SIZE_MS = 60_000L; // 1 minute

    private final Map<String, ClientWindow> rateLimitMap = new ConcurrentHashMap<>();

    public boolean isAllowed(String clientIdentifier) {
        long now = System.currentTimeMillis();
        ClientWindow window = rateLimitMap.compute(clientIdentifier, (key, existingWindow) -> {
            if (existingWindow == null || (now - existingWindow.startTime) > WINDOW_SIZE_MS) {
                return new ClientWindow(now, 1);
            } else {
                existingWindow.requestCount++;
                return existingWindow;
            }
        });

        return window.requestCount <= MAX_REQUESTS_PER_MINUTE;
    }

    private static class ClientWindow {
        private final long startTime;
        private int requestCount;

        public ClientWindow(long startTime, int requestCount) {
            this.startTime = startTime;
            this.requestCount = requestCount;
        }
    }
}
