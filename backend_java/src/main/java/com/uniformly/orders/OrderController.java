package com.uniformly.orders;

import com.uniformly.common.NotFoundException;
import com.uniformly.payment.RazorpayService;
import com.uniformly.products.ProductVariant;
import com.uniformly.products.ProductVariantRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private static final Set<String> CANCELLABLE_STATUSES = Set.of("PLACED", "PACKED");

    private final OrderRepository orders;
    private final OrderStatusHistoryRepository statusHistory;
    private final PaymentRepository payments;
    private final ProductVariantRepository variants;
    private final RazorpayService razorpayService;

    public OrderController(
            OrderRepository orders,
            OrderStatusHistoryRepository statusHistory,
            PaymentRepository payments,
            ProductVariantRepository variants,
            RazorpayService razorpayService
    ) {
        this.orders = orders;
        this.statusHistory = statusHistory;
        this.payments = payments;
        this.variants = variants;
        this.razorpayService = razorpayService;
    }

    @GetMapping
    public List<OrderResponse> getOrders() {
        Long userId = com.uniformly.auth.SecurityUtils.getAuthenticatedUserId();
        return orders.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(OrderResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public OrderResponse getOrderById(@PathVariable Long id) {
        Long userId = com.uniformly.auth.SecurityUtils.getAuthenticatedUserId();
        return orders.findByIdAndUserId(id, userId)
                .map(OrderResponse::from)
                .orElseThrow(() -> new NotFoundException("Order not found"));
    }

    @GetMapping("/by-number/{orderNumber}")
    public OrderResponse getOrderByNumber(@PathVariable String orderNumber) {
        Long userId = com.uniformly.auth.SecurityUtils.getAuthenticatedUserId();
        return orders.findByOrderNumberAndUserId(orderNumber, userId)
                .map(OrderResponse::from)
                .orElseThrow(() -> new NotFoundException("Order not found"));
    }

    @GetMapping("/{id}/tracking")
    public Map<String, Object> getOrderTracking(@PathVariable Long id) {
        Long userId = com.uniformly.auth.SecurityUtils.getAuthenticatedUserId();
        Order order = orders.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Order not found"));
        List<String> statuses = statusHistory.findByOrderIdOrderByCreatedAtAsc(id).stream()
                .map(OrderStatusHistory::getStatus)
                .toList();
        return Map.of(
                "orderNumber", order.getOrderNumber(),
                "currentStatus", order.getOrderStatus(),
                "history", statuses,
                "steps", List.of(
                        Map.of("status", "PLACED",    "label", "Order Placed", "completed", statuses.contains("PLACED")),
                        Map.of("status", "PACKED",    "label", "Packed",       "completed", statuses.contains("PACKED")),
                        Map.of("status", "SHIPPED",   "label", "Shipped",      "completed", statuses.contains("SHIPPED")),
                        Map.of("status", "DELIVERED", "label", "Delivered",    "completed", statuses.contains("DELIVERED"))
                )
        );
    }

    /**
     * Customer-initiated order cancellation.
     *
     * Rules:
     * - Only PLACED or PACKED orders can be cancelled (not shipped/delivered).
     * - PAID online orders → Razorpay refund is initiated, refund ID stored in status history.
     * - COD orders         → Just cancelled, no refund needed.
     * - Stock is restored for all cancelled orders.
     */
    @PostMapping("/{id}/cancel")
    @Transactional
    public Map<String, Object> cancelOrder(@PathVariable Long id) {
        Long userId = com.uniformly.auth.SecurityUtils.getAuthenticatedUserId();
        Order order = orders.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        // ── Guard: only cancellable statuses ──
        if (!CANCELLABLE_STATUSES.contains(order.getOrderStatus())) {
            throw new ResponseStatusException(
                HttpStatus.UNPROCESSABLE_ENTITY,
                "Order cannot be cancelled — it has already been " + order.getOrderStatus().toLowerCase() + "."
            );
        }

        boolean refundInitiated = false;
        String refundId = null;

        // ── Refund if payment was already captured ──
        if ("PAID".equals(order.getPaymentStatus()) && order.getRazorpayPaymentId() != null) {
            try {
                refundId = razorpayService.createRefund(
                        order.getRazorpayPaymentId(),
                        order.getTotalAmount()
                );
                refundInitiated = true;
            } catch (IllegalStateException e) {
                // Log but don't block the cancellation — admin can issue refund manually
                statusHistory.save(new OrderStatusHistory(order, "REFUND_FAILED",
                        "Auto-refund failed: " + e.getMessage() + " — manual action required"));
            }
        }

        // ── Restore stock for all items ──
        for (OrderItem item : order.getItems()) {
            if (item.getVariant() != null) {
                variants.findByIdWithLock(item.getVariant().getId()).ifPresent(v -> {
                    v.setStockQuantity(v.getStockQuantity() + item.getQuantity());
                    variants.save(v);
                });
            }
        }

        // Final copies for use inside lambdas (must be effectively final)
        final boolean finalRefundInitiated = refundInitiated;
        final String  finalRefundId        = refundId;

        // ── Update order status ──
        order.setOrderStatus("CANCELLED");
        order.setPaymentStatus(finalRefundInitiated ? "REFUND_INITIATED" : order.getPaymentStatus());
        orders.save(order);

        // ── Update payment record ──
        payments.findByOrderId(order.getId()).ifPresent(p -> {
            p.setStatus(finalRefundInitiated ? "REFUND_INITIATED" : "CANCELLED");
            if (finalRefundId != null) p.setProviderPaymentId(finalRefundId);
            payments.save(p);
        });

        // ── Status history ──
        String note = finalRefundInitiated
                ? "Cancelled by customer. Refund " + finalRefundId + " initiated — 5-7 business days."
                : "Cancelled by customer.";
        statusHistory.save(new OrderStatusHistory(order, "CANCELLED", note));

        return Map.of(
                "cancelled", true,
                "refundInitiated", finalRefundInitiated,
                "refundId", finalRefundId != null ? finalRefundId : "",
                "message", finalRefundInitiated
                        ? "Order cancelled. Refund of ₹" + order.getTotalAmount() + " will credit to your account in 5-7 business days."
                        : "Order cancelled successfully."
        );
    }
}
