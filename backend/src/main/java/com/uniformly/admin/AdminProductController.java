package com.uniformly.admin;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/products")
@CrossOrigin(origins = "*")
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
}
