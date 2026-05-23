package com.uniformly.admin;

import com.uniformly.common.NotFoundException;
import com.uniformly.products.*;
import com.uniformly.schools.School;
import com.uniformly.schools.SchoolRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

@Service
public class AdminProductService {
    private static final Path PRODUCT_UPLOAD_DIR = Path.of("uploads", "products");
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

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

    @org.springframework.cache.annotation.CacheEvict(value = {"products_v2", "featuredProducts"}, allEntries = true)
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
                        buildSku(saved.getId(), saved.getName(), size, color),
                        request.stockQuantity()
                );

                variantRepository.save(variant);
            }
        }

        return toResponse(saved);
    }

    public AdminImageUploadResponse uploadProductImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException("Image is required");
        }
        if (!ALLOWED_IMAGE_TYPES.contains(image.getContentType())) {
            throw new IllegalArgumentException("Only JPG, PNG, and WEBP images are allowed");
        }

        try {
            Files.createDirectories(PRODUCT_UPLOAD_DIR);
            String extension = extensionFor(image.getOriginalFilename(), image.getContentType());
            String fileName = UUID.randomUUID() + extension;
            Path destination = PRODUCT_UPLOAD_DIR.resolve(fileName).normalize();
            Files.copy(image.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            return new AdminImageUploadResponse("/uploads/products/" + fileName);
        } catch (IOException ex) {
            throw new IllegalArgumentException("Could not upload image");
        }
    }

    @org.springframework.cache.annotation.CacheEvict(value = {"products_v2", "featuredProducts", "productDetails"}, allEntries = true)
    public AdminProductResponse updateProduct(Long id, AdminProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        if (request.schoolId() != null) {
            School school = schoolRepository.findById(request.schoolId())
                    .orElseThrow(() -> new NotFoundException("School not found"));
            product.setSchool(school);
        }

        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new NotFoundException("Category not found"));
            product.setCategory(category);
        }

        if (request.name() != null) product.setName(request.name());
        if (request.description() != null) product.setDescription(request.description());
        if (request.price() != null) product.setPrice(request.price());
        if (request.compareAtPrice() != null) product.setCompareAtPrice(request.compareAtPrice());
        if (request.imageUrl() != null) product.setImageUrl(request.imageUrl());
        if (request.featured() != null) product.setFeatured(request.featured());

        return toResponse(productRepository.save(product));
    }

    @org.springframework.cache.annotation.CacheEvict(value = {"products_v2", "featuredProducts", "productDetails"}, allEntries = true)
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        product.setActive(false);
        productRepository.save(product);
    }

    /** Returns all variants for a product with their current stock. */
    @Transactional
    public List<AdminVariantStockResponse> getVariantStock(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));
        return product.getVariants().stream()
                .map(v -> new AdminVariantStockResponse(
                        v.getId(), v.getSize(), v.getColor(), v.getSku(), v.getStockQuantity()))
                .sorted(java.util.Comparator
                        .comparing(AdminVariantStockResponse::size)
                        .thenComparing(AdminVariantStockResponse::color))
                .toList();
    }

    /** Sets the stock quantity for a specific variant (restock or correction). */
    @org.springframework.cache.annotation.CacheEvict(value = {"products_v2", "productDetails"}, allEntries = true)
    @Transactional
    public AdminVariantStockResponse updateVariantStock(Long productId, Long variantId, int newQty) {
        if (newQty < 0) throw new IllegalArgumentException("Stock quantity cannot be negative");

        // Verify variant belongs to this product
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));
        ProductVariant variant = product.getVariants().stream()
                .filter(v -> v.getId().equals(variantId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Variant not found for this product"));

        variant.setStockQuantity(newQty);
        variantRepository.save(variant);

        return new AdminVariantStockResponse(
                variant.getId(), variant.getSize(), variant.getColor(),
                variant.getSku(), variant.getStockQuantity());
    }

    @org.springframework.cache.annotation.CacheEvict(value = {"products_v2", "productDetails"}, allEntries = true)
    @Transactional
    public List<AdminVariantStockResponse> initializeVariants(Long productId, List<String> sizes, List<String> colors, int initialStock) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        if (!product.getVariants().isEmpty()) {
            throw new IllegalStateException("Product already has variants configured");
        }

        for (String size : sizes) {
            for (String color : colors) {
                if (size.isBlank() || color.isBlank()) continue;
                ProductVariant variant = new ProductVariant(
                        product,
                        size.trim(),
                        color.trim(),
                        buildSku(product.getId(), product.getName(), size, color),
                        initialStock
                );
                variantRepository.save(variant);
                product.getVariants().add(variant);
            }
        }

        return product.getVariants().stream()
                .map(v -> new AdminVariantStockResponse(
                        v.getId(), v.getSize(), v.getColor(), v.getSku(), v.getStockQuantity()))
                .sorted(java.util.Comparator
                        .comparing(AdminVariantStockResponse::size)
                        .thenComparing(AdminVariantStockResponse::color))
                .toList();
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

    private String buildSku(Long productId, String name, String size, String color) {
        return name.toUpperCase()
                .replaceAll("[^A-Z0-9]+", "-")
                + "-"
                + productId
                + "-"
                + color.toUpperCase()
                + "-"
                + size.toUpperCase();
    }

    private String extensionFor(String originalFileName, String contentType) {
        if (originalFileName != null && originalFileName.contains(".")) {
            String extension = originalFileName.substring(originalFileName.lastIndexOf(".")).toLowerCase();
            if (List.of(".jpg", ".jpeg", ".png", ".webp").contains(extension)) {
                return extension;
            }
        }
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
