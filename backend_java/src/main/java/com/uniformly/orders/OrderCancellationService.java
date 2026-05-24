package com.uniformly.orders;

import com.uniformly.common.NotFoundException;
import com.uniformly.payment.RazorpayService;
import com.uniformly.products.ProductVariantRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class OrderCancellationService {

    public static final Set<String> CANCELLABLE_ORDER_STATUSES = Set.of("PLACED", "PACKED");

    public static final List<Map<String, String>> CANCELLATION_REASONS = List.of(
            Map.of("code", "ORDERED_BY_MISTAKE", "label", "Ordered by mistake"),
            Map.of("code", "FOUND_CHEAPER", "label", "Found a better price elsewhere"),
            Map.of("code", "DELIVERY_TOO_LATE", "label", "Delivery is too late"),
            Map.of("code", "WRONG_SIZE_COLOR", "label", "Wrong size or colour"),
            Map.of("code", "CHANGED_MIND", "label", "Changed my mind"),
            Map.of("code", "OTHER", "label", "Other reason")
    );

    private static final Set<String> VALID_REASON_CODES = Set.of(
            "ORDERED_BY_MISTAKE", "FOUND_CHEAPER", "DELIVERY_TOO_LATE",
            "WRONG_SIZE_COLOR", "CHANGED_MIND", "OTHER"
    );

    private final OrderRepository orders;
    private final OrderStatusHistoryRepository statusHistory;
    private final PaymentRepository payments;
    private final ProductVariantRepository variants;
    private final OrderCancellationRepository cancellations;
    private final RazorpayService razorpayService;

    public OrderCancellationService(
            OrderRepository orders,
            OrderStatusHistoryRepository statusHistory,
            PaymentRepository payments,
            ProductVariantRepository variants,
            OrderCancellationRepository cancellations,
            RazorpayService razorpayService
    ) {
        this.orders = orders;
        this.statusHistory = statusHistory;
        this.payments = payments;
        this.variants = variants;
        this.cancellations = cancellations;
        this.razorpayService = razorpayService;
    }

    public List<Map<String, String>> getCancellationReasons() {
        return CANCELLATION_REASONS;
    }

    public static boolean isCancellable(String orderStatus) {
        return orderStatus != null && CANCELLABLE_ORDER_STATUSES.contains(orderStatus);
    }

    @Transactional
    public CancelOrderResponse cancelByCustomer(Long userId, Long orderId, String reasonCode) {
        if (reasonCode == null || reasonCode.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please select a cancellation reason.");
        }
        String normalizedReason = reasonCode.trim().toUpperCase();
        if (!VALID_REASON_CODES.contains(normalizedReason)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid cancellation reason.");
        }

        Order order = orders.findByIdAndUserIdForUpdate(orderId, userId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        if ("CANCELLED".equals(order.getOrderStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This order is already cancelled.");
        }

        if (!CANCELLABLE_ORDER_STATUSES.contains(order.getOrderStatus())) {
            String status = order.getOrderStatus();
            String message = switch (status) {
                case "SHIPPED" -> "Your order has already been shipped and cannot be cancelled online. Please refuse delivery or contact support.";
                case "DELIVERED" -> "Delivered orders cannot be cancelled. Please use the return process instead.";
                case "PAYMENT_FAILED" -> "This order was not placed successfully due to payment failure.";
                default -> "Order cannot be cancelled at its current stage (" + status + ").";
            };
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, message);
        }

        boolean refundInitiated = false;
        String refundId = null;
        String refundStatus = "NOT_APPLICABLE";

        if ("PAID".equals(order.getPaymentStatus()) && order.getRazorpayPaymentId() != null) {
            try {
                refundId = razorpayService.createRefund(order.getRazorpayPaymentId(), order.getTotalAmount());
                refundInitiated = true;
                refundStatus = "INITIATED";
            } catch (IllegalStateException e) {
                refundStatus = "FAILED";
                statusHistory.save(new OrderStatusHistory(order, "REFUND_FAILED",
                        "Auto-refund failed: " + e.getMessage() + " — manual action required"));
            }
        } else if ("PAID".equals(order.getPaymentStatus())) {
            refundStatus = "PENDING_MANUAL";
        }

        if (shouldRestoreStock(order)) {
            restoreStock(order);
        }

        String reasonLabel = CANCELLATION_REASONS.stream()
                .filter(r -> r.get("code").equals(normalizedReason))
                .map(r -> r.get("label"))
                .findFirst()
                .orElse(normalizedReason);

        LocalDateTime now = LocalDateTime.now();
        order.setOrderStatus("CANCELLED");
        order.setCancellationReason(reasonLabel);
        order.setCancelledAt(now);
        order.setCancelledBy("CUSTOMER");

        if (refundInitiated) {
            order.setPaymentStatus("REFUND_INITIATED");
        } else if (!"PAID".equals(order.getPaymentStatus())) {
            order.setPaymentStatus("CANCELLED");
        }

        orders.save(order);

        final boolean finalRefundInitiated = refundInitiated;
        final String finalRefundId = refundId;
        final String finalRefundStatus = refundStatus;

        payments.findByOrderId(order.getId()).ifPresent(p -> {
            if (finalRefundInitiated) {
                p.setStatus("REFUND_INITIATED");
            } else {
                p.setStatus("CANCELLED");
            }
            if (finalRefundId != null) {
                p.setProviderPaymentId(finalRefundId);
            }
            payments.save(p);
        });

        cancellations.save(new OrderCancellation(
                order, userId, reasonLabel, "CUSTOMER", finalRefundStatus
        ));

        String historyNote = "Cancelled by customer. Reason: " + reasonLabel + ".";
        if (finalRefundInitiated) {
            historyNote += " Refund " + finalRefundId + " initiated — 5–7 business days.";
        }
        statusHistory.save(new OrderStatusHistory(order, "CANCELLED", historyNote));

        String message = finalRefundInitiated
                ? "Order cancelled. Refund of ₹" + order.getTotalAmount() + " will credit to your account in 5–7 business days."
                : "COD".equalsIgnoreCase(order.getPaymentMethod()) || "PENDING".equals(order.getPaymentStatus())
                ? "Order cancelled successfully."
                : "Order cancelled successfully.";

        return new CancelOrderResponse(
                true,
                finalRefundInitiated,
                finalRefundStatus,
                finalRefundId != null ? finalRefundId : "",
                message,
                order.getOrderNumber(),
                "CANCELLED"
        );
    }

    private boolean shouldRestoreStock(Order order) {
        if ("COD".equalsIgnoreCase(order.getPaymentMethod())) {
            return true;
        }
        return "PAID".equals(order.getPaymentStatus());
    }

    private void restoreStock(Order order) {
        for (OrderItem item : order.getItems()) {
            if (item.getVariant() != null) {
                variants.findByIdWithLock(item.getVariant().getId()).ifPresent(v -> {
                    v.setStockQuantity(v.getStockQuantity() + item.getQuantity());
                    variants.save(v);
                });
            }
        }
    }

    public record CancelOrderResponse(
            boolean success,
            boolean refundInitiated,
            String refundStatus,
            String refundId,
            String message,
            String orderNumber,
            String status
    ) {}
}
