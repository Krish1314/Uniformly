package com.uniformly.admin;

import java.math.BigDecimal;

public record AdminTopProductResponse(
        Long productId,
        String name,
        String imageUrl,
        Long unitsSold,
        BigDecimal revenue
) {}
