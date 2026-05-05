package com.uniformly.products;

import com.uniformly.common.NotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@CrossOrigin(origins = "*")
public class ProductController {
    private final ProductRepository products;

    public ProductController(ProductRepository products) {
        this.products = products;
    }

    @GetMapping
    public List<ProductResponse> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long schoolId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String sort
    ) {
        List<Product> list = products.findAll().stream()
                .filter(Product::isActive)
                .filter(p -> search == null || search.isBlank() || p.getName().toLowerCase().contains(search.toLowerCase()))
                .filter(p -> schoolId == null || (p.getSchool() != null && p.getSchool().getId().equals(schoolId)))
                .filter(p -> category == null || category.isBlank() || 
                        (p.getCategory() != null && (p.getCategory().getSlug().equalsIgnoreCase(category) || p.getCategory().getName().equalsIgnoreCase(category))))
                .collect(java.util.stream.Collectors.toList());
        
        if ("price_asc".equalsIgnoreCase(sort)) {
            list.sort((a, b) -> {
                java.math.BigDecimal p1 = a.getPrice() != null ? a.getPrice() : java.math.BigDecimal.ZERO;
                java.math.BigDecimal p2 = b.getPrice() != null ? b.getPrice() : java.math.BigDecimal.ZERO;
                return p1.compareTo(p2);
            });
        } else if ("price_desc".equalsIgnoreCase(sort)) {
            list.sort((a, b) -> {
                java.math.BigDecimal p1 = a.getPrice() != null ? a.getPrice() : java.math.BigDecimal.ZERO;
                java.math.BigDecimal p2 = b.getPrice() != null ? b.getPrice() : java.math.BigDecimal.ZERO;
                return p2.compareTo(p1);
            });
        } else {
            list.sort((a, b) -> {
                java.time.LocalDateTime t1 = a.getCreatedAt() != null ? a.getCreatedAt() : java.time.LocalDateTime.MIN;
                java.time.LocalDateTime t2 = b.getCreatedAt() != null ? b.getCreatedAt() : java.time.LocalDateTime.MIN;
                return t2.compareTo(t1);
            });
        }

        return list.stream()
                .map(ProductResponse::from)
                .toList();
    }

    @GetMapping("/featured")
    public List<ProductResponse> getFeaturedProducts() {
        return products.findTop8ByFeaturedTrueAndActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(ProductResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public ProductResponse getProductById(@PathVariable Long id) {
        Product product = products.findById(id)
                .filter(Product::isActive)
                .orElseThrow(() -> new NotFoundException("Product not found"));
        return ProductResponse.from(product);
    }

    @GetMapping("/{id}/related")
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
