package com.uniformly.products;

import com.uniformly.common.NotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {
    private final ProductRepository products;

    public ProductController(ProductRepository products) {
        this.products = products;
    }

    @GetMapping
    @org.springframework.cache.annotation.Cacheable(value = "products", key = "{#search, #schoolId, #category, #sort}")
    public List<ProductResponse> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long schoolId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String sort
    ) {
        return products.search(blankToNull(search), schoolId, blankToNull(category), blankToNull(sort))
                .stream()
                .map(ProductResponse::from)
                .toList();
    }

    @GetMapping("/featured")
    @org.springframework.cache.annotation.Cacheable("featuredProducts")
    public List<ProductResponse> getFeaturedProducts() {
        return products.findTop8ByFeaturedTrueAndActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(ProductResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    @org.springframework.cache.annotation.Cacheable(value = "productDetails", key = "#id")
    public ProductResponse getProductById(@PathVariable Long id) {
        Product product = products.findById(id)
                .filter(Product::isActive)
                .orElseThrow(() -> new NotFoundException("Product not found"));
        return ProductResponse.from(product);
    }

    @GetMapping("/{id}/related")
    @org.springframework.cache.annotation.Cacheable(value = "relatedProducts", key = "#id")
    public List<ProductResponse> getRelatedProducts(@PathVariable Long id) {
        Product product = products.findById(id)
                .filter(Product::isActive)
                .orElseThrow(() -> new NotFoundException("Product not found"));
        return products.findTop4BySchoolIdAndActiveTrueAndIdNot(product.getSchool().getId(), id)
                .stream()
                .map(ProductResponse::from)
                .toList();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
