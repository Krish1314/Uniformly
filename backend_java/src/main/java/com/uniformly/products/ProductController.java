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
    @org.springframework.cache.annotation.Cacheable(value = "products", key = "{#search, #schoolId, #category, #sort, #page, #size}")
    public org.springframework.http.ResponseEntity<java.util.Map<String, Object>> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long schoolId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        org.springframework.data.domain.Sort sorting = switch (sort != null ? sort : "newest") {
            case "price_asc" -> org.springframework.data.domain.Sort.by("price").ascending();
            case "price_desc" -> org.springframework.data.domain.Sort.by("price").descending();
            default -> org.springframework.data.domain.Sort.by("createdAt").descending();
        };

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, sorting);
        org.springframework.data.domain.Page<Product> productPage = products.search(blankToNull(search), schoolId, blankToNull(category), pageable);

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("products", productPage.getContent().stream().map(ProductResponse::from).toList());
        response.put("currentPage", productPage.getNumber());
        response.put("totalItems", productPage.getTotalElements());
        response.put("totalPages", productPage.getTotalPages());

        return org.springframework.http.ResponseEntity.ok()
                .header("Cache-Control", "public, max-age=60")
                .body(response);
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
    public org.springframework.http.ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        Product product = products.findById(id)
                .filter(Product::isActive)
                .orElseThrow(() -> new NotFoundException("Product not found"));
        return org.springframework.http.ResponseEntity.ok()
                .header("Cache-Control", "public, max-age=60")
                .body(ProductResponse.from(product));
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
