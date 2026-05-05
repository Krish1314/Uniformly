package com.uniformly.admin;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record AdminDashboardResponse(
        BigDecimal totalRevenue,
        Long totalOrders,
        Long pendingOrders,
        Long totalProducts,
        Long lowStockProducts,
        List<AdminRecentOrderResponse> recentOrders,
        List<AdminTopProductResponse> topProducts,
        Map<String, Long> orderStatusCounts,
        Map<String, BigDecimal> dailySales
) {}
