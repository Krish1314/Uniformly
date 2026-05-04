package com.uniformly.admin;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AdminOrderResponse(
        Long id,
        String orderNumber,
        LocalDateTime createdAt,
        String customerName,
        String customerEmail,
        String paymentMethod,
        BigDecimal totalAmount,
        String status
) {}
