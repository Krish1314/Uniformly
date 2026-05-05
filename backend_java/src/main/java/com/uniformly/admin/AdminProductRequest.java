package com.uniformly.admin;

import java.math.BigDecimal;
import java.util.List;

public record AdminProductRequest(
        String name,
        Long schoolId,
        Long categoryId,
        BigDecimal price,
        BigDecimal compareAtPrice,
        String imageUrl,
        String description,
        Boolean featured,
        Integer stockQuantity,
        List<String> sizes,
        List<String> colors
) {}
