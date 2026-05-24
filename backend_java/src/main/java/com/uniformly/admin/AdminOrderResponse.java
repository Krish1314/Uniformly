package com.uniformly.admin;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AdminOrderResponse(
        Long id,
        String orderNumber,
        LocalDateTime createdAt,
        String customerName,
        String customerEmail,
        String customerUuid,
        String paymentMethod,
        String paymentStatus,
        BigDecimal subtotal,
        BigDecimal shippingFee,
        BigDecimal gstAmount,
        BigDecimal totalAmount,
        Integer itemCount,
        String itemDetails,
        String deliveryAddress,
        String deliveryPhone,
        String status,
        String transactionId,
        String cancellationReason,
        LocalDateTime cancelledAt
) {}
