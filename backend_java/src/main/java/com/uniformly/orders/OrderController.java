package com.uniformly.orders;

import com.uniformly.common.NotFoundException;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderRepository orders;
    private final OrderStatusHistoryRepository statusHistory;
    private final OrderCancellationService cancellationService;

    public OrderController(
            OrderRepository orders,
            OrderStatusHistoryRepository statusHistory,
            OrderCancellationService cancellationService
    ) {
        this.orders = orders;
        this.statusHistory = statusHistory;
        this.cancellationService = cancellationService;
    }

    @GetMapping
    public List<OrderResponse> getOrders() {
        Long userId = com.uniformly.auth.SecurityUtils.getAuthenticatedUserId();
        return orders.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(OrderResponse::from)
                .toList();
    }

    @GetMapping("/cancellation-reasons")
    public List<Map<String, String>> getCancellationReasons() {
        return cancellationService.getCancellationReasons();
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
     * Customer-initiated cancellation (Myntra-style).
     * Requires a reason; uses row lock to avoid race with warehouse updates.
     */
    @PostMapping("/{id}/cancel")
    public OrderCancellationService.CancelOrderResponse cancelOrder(
            @PathVariable Long id,
            @Valid @RequestBody CancelOrderRequest request
    ) {
        Long userId = com.uniformly.auth.SecurityUtils.getAuthenticatedUserId();
        return cancellationService.cancelByCustomer(userId, id, request.reason());
    }
}
