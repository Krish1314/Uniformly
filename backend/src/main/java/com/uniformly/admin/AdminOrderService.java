package com.uniformly.admin;

import com.uniformly.common.NotFoundException;
import com.uniformly.orders.Order;
import com.uniformly.orders.OrderRepository;
import com.uniformly.orders.OrderStatusHistory;
import com.uniformly.orders.OrderStatusHistoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminOrderService {

    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository statusHistoryRepository;

    public AdminOrderService(
            OrderRepository orderRepository,
            OrderStatusHistoryRepository statusHistoryRepository
    ) {
        this.orderRepository = orderRepository;
        this.statusHistoryRepository = statusHistoryRepository;
    }

    public List<AdminOrderResponse> getOrders(String search, String status) {
        List<Order> orders = orderRepository.findAll();

        if (search != null && !search.isBlank()) {
            final String searchLower = search.toLowerCase();
            orders = orders.stream()
                    .filter(o -> (o.getOrderNumber() != null && o.getOrderNumber().toLowerCase().contains(searchLower)) ||
                            (o.getUser() != null && (
                                    (o.getUser().getFirstName() != null && o.getUser().getFirstName().toLowerCase().contains(searchLower)) ||
                                    (o.getUser().getLastName() != null && o.getUser().getLastName().toLowerCase().contains(searchLower)) ||
                                    (o.getUser().getEmail() != null && o.getUser().getEmail().toLowerCase().contains(searchLower))
                            ))
                    )
                    .toList();
        }

        if (status != null && !status.isBlank()) {
            final String statusUpper = status.toUpperCase();
            orders = orders.stream()
                    .filter(o -> o.getOrderStatus() != null && o.getOrderStatus().toUpperCase().equals(statusUpper))
                    .toList();
        }

        return orders.stream()
                .map(this::toResponse)
                .toList();
    }

    public AdminOrderResponse updateStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        order.setOrderStatus(status.toUpperCase());
        Order saved = orderRepository.save(order);

        statusHistoryRepository.save(
                new OrderStatusHistory(saved, status.toUpperCase(), "Updated by admin")
        );

        return toResponse(saved);
    }

    private AdminOrderResponse toResponse(Order order) {
        return new AdminOrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getCreatedAt(),
                order.getUser().getFirstName() + " " + order.getUser().getLastName(),
                order.getUser().getEmail(),
                order.getPaymentMethod(),
                order.getTotalAmount(),
                order.getOrderStatus()
        );
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
