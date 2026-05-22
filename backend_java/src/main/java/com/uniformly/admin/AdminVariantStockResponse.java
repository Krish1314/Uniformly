package com.uniformly.admin;

public record AdminVariantStockResponse(
        Long variantId,
        String size,
        String color,
        String sku,
        int stockQuantity
) {}
