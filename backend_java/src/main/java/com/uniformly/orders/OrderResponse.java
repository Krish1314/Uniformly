package com.uniformly.orders;

import com.uniformly.addresses.Address;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        String orderNumber,
        String status,
        String paymentStatus,
        String paymentMethod,
        BigDecimal subtotal,
        BigDecimal shippingFee,
        BigDecimal gstAmount,
        BigDecimal totalAmount,
        LocalDateTime createdAt,
        AddressView address,
        List<OrderItemView> items,
        boolean canCancel,
        String cancellationReason,
        LocalDateTime cancelledAt
) {
    public static OrderResponse from(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getOrderStatus(),
                order.getPaymentStatus(),
                order.getPaymentMethod(),
                order.getSubtotal(),
                order.getShippingFee(),
                order.getGstAmount(),
                order.getTotalAmount(),
                order.getCreatedAt(),
                AddressView.from(order.getAddress()),
                order.getItems().stream().map(OrderItemView::from).toList(),
                OrderCancellationService.isCancellable(order.getOrderStatus()),
                order.getCancellationReason(),
                order.getCancelledAt()
        );
    }

    public record AddressView(String fullName, String phone, String addressLine, String city, String state, String pincode) {
        static AddressView from(Address address) {
            if (address == null) {
                return null;
            }
            return new AddressView(
                    address.getFullName(),
                    address.getPhone(),
                    address.getAddressLine(),
                    address.getCity(),
                    address.getState(),
                    address.getPincode()
            );
        }
    }

    public record OrderItemView(
            String productName,
            String schoolName,
            String size,
            String color,
            int quantity,
            BigDecimal unitPrice,
            BigDecimal totalPrice,
            String imageUrl
    ) {
        static OrderItemView from(OrderItem item) {
            String img = (item.getProduct() != null) ? item.getProduct().getImageUrl() : null;
            return new OrderItemView(
                    item.getProductName(),
                    item.getSchoolName(),
                    item.getSize(),
                    item.getColor(),
                    item.getQuantity(),
                    item.getUnitPrice(),
                    item.getTotalPrice(),
                    img
            );
        }
    }
}
