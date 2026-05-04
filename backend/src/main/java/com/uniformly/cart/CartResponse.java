package com.uniformly.cart;

import java.math.BigDecimal;
import java.util.List;

public record CartResponse(
        List<CartItemResponse> items,
        BigDecimal subtotal,
        int itemCount
) {
    public static CartResponse from(List<CartItem> items) {
        BigDecimal subtotal = items.stream()
                .map(item -> item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int itemCount = items.stream().mapToInt(CartItem::getQuantity).sum();
        return new CartResponse(items.stream().map(CartItemResponse::from).toList(), subtotal, itemCount);
    }

    public record CartItemResponse(
            Long id,
            Long productId,
            Long variantId,
            String name,
            String school,
            String size,
            String color,
            BigDecimal price,
            int quantity,
            String imageUrl
    ) {
        static CartItemResponse from(CartItem item) {
            return new CartItemResponse(
                    item.getId(),
                    item.getProduct().getId(),
                    item.getVariant().getId(),
                    item.getProduct().getName(),
                    item.getProduct().getSchool().getName(),
                    item.getVariant().getSize(),
                    item.getVariant().getColor(),
                    item.getProduct().getPrice(),
                    item.getQuantity(),
                    item.getProduct().getImageUrl()
            );
        }
    }
}
