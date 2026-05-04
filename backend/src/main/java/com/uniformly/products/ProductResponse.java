package com.uniformly.products;

import java.math.BigDecimal;
import java.util.List;

public record ProductResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        BigDecimal gstRate,
        SchoolView school,
        String category,
        String imageUrl,
        List<String> images,
        List<VariantView> variants
) {
    public static ProductResponse from(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getGstRate(),
                new SchoolView(product.getSchool().getId(), product.getSchool().getName()),
                product.getCategory().getName(),
                product.getImageUrl(),
                product.getImageUrl() != null ? List.of(product.getImageUrl()) : java.util.Collections.emptyList(),
                product.getVariants().stream().map(VariantView::from).toList()
        );
    }

    public record SchoolView(Long id, String name) {
    }

    public record VariantView(Long id, String size, String color, String sku, int stockQuantity) {
        static VariantView from(ProductVariant variant) {
            return new VariantView(
                    variant.getId(),
                    variant.getSize(),
                    variant.getColor(),
                    variant.getSku(),
                    variant.getStockQuantity()
            );
        }
    }
}
