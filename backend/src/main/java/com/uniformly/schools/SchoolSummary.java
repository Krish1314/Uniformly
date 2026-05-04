package com.uniformly.schools;

public record SchoolSummary(
        Long id,
        String name,
        String city,
        String state,
        String logoUrl,
        Long itemsCount
) {
}
