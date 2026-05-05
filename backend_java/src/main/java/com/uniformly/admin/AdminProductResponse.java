package com.uniformly.admin;

import java.math.BigDecimal;

public record AdminProductResponse(
        Long id,
        String name,
        String school,
        String category,
        BigDecimal price,
        BigDecimal compareAtPrice,
        String imageUrl,
        Boolean featured,
        Integer stockQuantity
) {}
