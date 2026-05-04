package com.uniformly.admin;

import com.uniformly.common.NotFoundException;
import com.uniformly.products.*;
import com.uniformly.schools.School;
import com.uniformly.schools.SchoolRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminProductService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final SchoolRepository schoolRepository;
    private final CategoryRepository categoryRepository;

    public AdminProductService(
            ProductRepository productRepository,
            ProductVariantRepository variantRepository,
            SchoolRepository schoolRepository,
            CategoryRepository categoryRepository
    ) {
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
        this.schoolRepository = schoolRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<AdminProductResponse> getProducts(String search) {
        List<Product> products = productRepository.findAll()
                .stream()
                .filter(Product::isActive)
                .toList();

        if (search != null && !search.isBlank()) {
            final String searchLower = search.toLowerCase();
            products = products.stream()
                    .filter(p -> p.getName() != null && p.getName().toLowerCase().contains(searchLower))
                    .toList();
        }

        return products.stream()
                .map(this::toResponse)
                .toList();
    }

    public AdminProductResponse createProduct(AdminProductRequest request) {
        School school = schoolRepository.findById(request.schoolId())
                .orElseThrow(() -> new NotFoundException("School not found"));

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new NotFoundException("Category not found"));

        Product product = new Product(
                school,
                category,
                request.name(),
                request.description(),
                request.price(),
                request.compareAtPrice(),
                request.imageUrl(),
                Boolean.TRUE.equals(request.featured())
        );

        Product saved = productRepository.save(product);

        for (String size : request.sizes()) {
            for (String color : request.colors()) {
                ProductVariant variant = new ProductVariant(
                        saved,
                        size.trim(),
                        color.trim(),
                        buildSku(saved.getName(), size, color),
                        request.stockQuantity()
                );

                variantRepository.save(variant);
            }
        }

        return toResponse(saved);
    }

    public AdminProductResponse updateProduct(Long id, AdminProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        School school = schoolRepository.findById(request.schoolId())
                .orElseThrow(() -> new NotFoundException("School not found"));

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new NotFoundException("Category not found"));

        product.setName(request.name());
        product.setSchool(school);
        product.setCategory(category);
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setCompareAtPrice(request.compareAtPrice());
        product.setImageUrl(request.imageUrl());
        product.setFeatured(Boolean.TRUE.equals(request.featured()));

        return toResponse(productRepository.save(product));
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        product.setActive(false);
        productRepository.save(product);
    }

    private AdminProductResponse toResponse(Product product) {
        int stock = product.getVariants()
                .stream()
                .mapToInt(ProductVariant::getStockQuantity)
                .sum();

        return new AdminProductResponse(
                product.getId(),
                product.getName(),
                product.getSchool().getName(),
                product.getCategory().getName(),
                product.getPrice(),
                product.getCompareAtPrice(),
                product.getImageUrl(),
                product.isFeatured(),
                stock
        );
    }

    private String buildSku(String name, String size, String color) {
        return name.toUpperCase()
                .replaceAll("[^A-Z0-9]+", "-")
                + "-"
                + color.toUpperCase()
                + "-"
                + size.toUpperCase();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
