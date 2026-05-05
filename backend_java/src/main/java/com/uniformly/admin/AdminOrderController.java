package com.uniformly.admin;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/orders")
@CrossOrigin(origins = "*")
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    public AdminOrderController(AdminOrderService adminOrderService) {
        this.adminOrderService = adminOrderService;
    }

    @GetMapping
    public List<AdminOrderResponse> getOrders(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status
    ) {
        return adminOrderService.getOrders(search, status);
    }

    @PatchMapping("/{id}/status")
    public AdminOrderResponse updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateOrderStatusRequest request
    ) {
        return adminOrderService.updateStatus(id, request.status());
    }
}
