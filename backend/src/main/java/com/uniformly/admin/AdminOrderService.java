package com.uniformly.admin;

import com.uniformly.common.NotFoundException;
import com.uniformly.orders.Order;
import com.uniformly.orders.OrderItem;
import com.uniformly.orders.OrderRepository;
import com.uniformly.orders.OrderStatusHistory;
import com.uniformly.orders.OrderStatusHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional(readOnly = true)
    public List<AdminOrderResponse> getOrders(String search, String status) {
        return orderRepository.adminSearchOrders(blankToNull(search), blankToNull(status)).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
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
        String customerName = order.getUser().getFirstName() + " " + order.getUser().getLastName();
        String itemDetails = order.getItems().stream()
                .map(this::formatItem)
                .toList()
                .stream()
                .reduce((left, right) -> left + " | " + right)
                .orElse("");

        return new AdminOrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getCreatedAt(),
                customerName.trim(),
                order.getUser().getEmail(),
                order.getPaymentMethod(),
                order.getPaymentStatus(),
                order.getSubtotal(),
                order.getShippingFee(),
                order.getGstAmount(),
                order.getTotalAmount(),
                order.getItems().stream().mapToInt(OrderItem::getQuantity).sum(),
                itemDetails,
                formatAddress(order),
                order.getAddress() != null ? order.getAddress().getPhone() : "",
                order.getOrderStatus()
        );
    }

    private String formatItem(OrderItem item) {
        return item.getProductName()
                + " - Size: " + item.getSize()
                + ", Color: " + item.getColor()
                + ", Qty: " + item.getQuantity()
                + ", Unit: " + item.getUnitPrice()
                + ", Total: " + item.getTotalPrice();
    }

    private String formatAddress(Order order) {
        if (order.getAddress() == null) {
            return "";
        }
        return order.getAddress().getFullName()
                + ", " + order.getAddress().getAddressLine()
                + ", " + order.getAddress().getCity()
                + ", " + order.getAddress().getState()
                + " - " + order.getAddress().getPincode();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
