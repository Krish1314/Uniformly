package com.uniformly.admin;

import com.uniformly.orders.Order;
import com.uniformly.orders.OrderRepository;
import com.uniformly.products.ProductRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public AdminDashboardService(
            OrderRepository orderRepository,
            ProductRepository productRepository
    ) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    public AdminDashboardResponse getDashboard() {
        BigDecimal totalRevenue = orderRepository.sumPaidRevenue();
        Long totalOrders = orderRepository.count();
        Long pendingOrders = orderRepository.countByOrderStatus("PLACED");
        Long totalProducts = productRepository.countActiveProducts();
        Long lowStockProducts = productRepository.countLowStockProducts(10);

        var recentOrders = orderRepository.findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(order -> new AdminRecentOrderResponse(
                        order.getId(),
                        order.getOrderNumber(),
                        order.getUser().getFirstName() + " " + order.getUser().getLastName(),
                        order.getUser().getEmail(),
                        order.getTotalAmount(),
                        order.getOrderStatus(),
                        order.getPaymentMethod(),
                        order.getCreatedAt()
                ))
                .toList();

        var topProducts = orderRepository.findTopProducts()
                .stream()
                .map(row -> new AdminTopProductResponse(
                        (Long) row[0],
                        (String) row[1],
                        (String) row[2],
                        (Long) row[3],
                        (BigDecimal) row[4]
                ))
                .toList();

        Map<String, Long> orderStatusCounts = orderRepository.findOrderStatusCounts()
                .stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]
                ));

        // Calculate Last 14 Days Daily Sales
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("MMM dd");

        Map<String, BigDecimal> dailySales = new java.util.LinkedHashMap<>();
        for (int i = 13; i >= 0; i--) {
            String dateStr = now.minusDays(i).format(formatter);
            dailySales.put(dateStr, BigDecimal.ZERO);
        }

        java.time.LocalDateTime startDate = now.minusDays(14).withHour(0).withMinute(0).withSecond(0);
        var orders = orderRepository.findByCreatedAtAfter(startDate);

        for (Order order : orders) {
            String dateStr = order.getCreatedAt().format(formatter);
            if (dailySales.containsKey(dateStr)) {
                dailySales.put(dateStr, dailySales.get(dateStr).add(order.getTotalAmount()));
            }
        }

        return new AdminDashboardResponse(
                totalRevenue == null ? BigDecimal.ZERO : totalRevenue,
                totalOrders,
                pendingOrders,
                totalProducts,
                lowStockProducts,
                recentOrders,
                topProducts,
                orderStatusCounts,
                dailySales
        );
    }
}
