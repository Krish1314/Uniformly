package com.uniformly.admin;

import com.uniformly.products.Category;
import com.uniformly.products.CategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/categories")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCategoryController {
    private final CategoryRepository categoryRepository;

    public AdminCategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @PutMapping("/{id}/size-guide")
    public ResponseEntity<?> updateSizeGuide(
            @PathVariable Long id,
            @RequestBody SizeGuideRequest request
    ) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        category.setSizeGuideImageUrl(request.imageUrl());
        category.setSizeGuideNotes(request.notes());
        category.setSizeChartData(request.chartData());
        
        categoryRepository.save(category);
        return ResponseEntity.ok().build();
    }
}

record SizeGuideRequest(String imageUrl, String notes, String chartData) {}
