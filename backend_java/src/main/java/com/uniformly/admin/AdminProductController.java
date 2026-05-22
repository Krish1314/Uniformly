package com.uniformly.admin;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/products")
public class AdminProductController {

    private final AdminProductService adminProductService;

    public AdminProductController(AdminProductService adminProductService) {
        this.adminProductService = adminProductService;
    }

    @GetMapping
    public List<AdminProductResponse> getProducts(
            @RequestParam(required = false) String search
    ) {
        return adminProductService.getProducts(search);
    }

    @PostMapping
    public AdminProductResponse createProduct(
            @RequestBody AdminProductRequest request
    ) {
        return adminProductService.createProduct(request);
    }

    @PostMapping("/images")
    public AdminImageUploadResponse uploadProductImage(
            @RequestParam("image") MultipartFile image
    ) {
        return adminProductService.uploadProductImage(image);
    }

    @PatchMapping("/{id}")
    public AdminProductResponse updateProduct(
            @PathVariable Long id,
            @RequestBody AdminProductRequest request
    ) {
        return adminProductService.updateProduct(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        adminProductService.deleteProduct(id);
    }

    /** Returns all variants for a product with their current stock levels. */
    @GetMapping("/{id}/variants")
    public List<AdminVariantStockResponse> getVariants(@PathVariable Long id) {
        return adminProductService.getVariantStock(id);
    }

    /** Update stock quantity for a single variant. */
    @PatchMapping("/{id}/variants/{variantId}/stock")
    public AdminVariantStockResponse updateVariantStock(
            @PathVariable Long id,
            @PathVariable Long variantId,
            @RequestBody Map<String, Integer> body
    ) {
        int newQty = body.getOrDefault("stockQuantity", 0);
        return adminProductService.updateVariantStock(id, variantId, newQty);
    }

    /** Dynamically initialize variants for a product that doesn't have any yet. */
    @PostMapping("/{id}/variants/initialize")
    public List<AdminVariantStockResponse> initializeVariants(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body
    ) {
        List<String> sizes = (List<String>) body.getOrDefault("sizes", List.of());
        List<String> colors = (List<String>) body.getOrDefault("colors", List.of());
        int initialStock = ((Number) body.getOrDefault("stockQuantity", 0)).intValue();
        return adminProductService.initializeVariants(id, sizes, colors, initialStock);
    }
}
