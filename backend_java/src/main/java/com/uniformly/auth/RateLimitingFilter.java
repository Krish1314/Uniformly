package com.uniformly.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * A simple in-memory rate limiter to protect Auth endpoints (Login/Register).
 * Limits requests to 5 per minute per IP address.
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final Map<String, RequestCounter> limitMap = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS = 5;
    private static final long TIME_WINDOW = TimeUnit.MINUTES.toMillis(1);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        
        // Only rate-limit login, register and google oauth endpoints
        if (path.contains("/api/v1/auth/login") || path.contains("/api/v1/auth/register") || path.contains("/api/v1/auth/google")) {
            String clientIp = request.getRemoteAddr();
            
            if (isRateLimited(clientIp)) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.getWriter().write("Too many requests. Please try again in a minute.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isRateLimited(String ip) {
        long now = System.currentTimeMillis();
        limitMap.entrySet().removeIf(entry -> now - entry.getValue().timestamp > TIME_WINDOW);
        
        RequestCounter counter = limitMap.compute(ip, (key, val) -> {
            if (val == null || now - val.timestamp > TIME_WINDOW) {
                return new RequestCounter(1, now);
            }
            val.count++;
            return val;
        });

        return counter.count > MAX_REQUESTS;
    }

    private static class RequestCounter {
        int count;
        long timestamp;

        RequestCounter(int count, long timestamp) {
            this.count = count;
            this.timestamp = timestamp;
        }
    }
}
