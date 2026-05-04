package com.uniformly.admin;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AdminRecentOrderResponse(
        Long id,
        String orderNumber,
        String customerName,
        String customerEmail,
        BigDecimal totalAmount,
        String status,
        String paymentMethod,
        LocalDateTime createdAt
) {}
