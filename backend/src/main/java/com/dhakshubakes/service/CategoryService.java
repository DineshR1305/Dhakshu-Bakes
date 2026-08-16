package com.dhakshubakes.service;

import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.dto.CategoryDTO;
import com.dhakshubakes.entity.Category;
import com.dhakshubakes.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public ApiResponse<List<CategoryDTO.Response>> getAllActiveCategories() {
        List<CategoryDTO.Response> categories = categoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ApiResponse.success("Categories retrieved successfully", categories);
    }

    @Transactional(readOnly = true)
    public ApiResponse<CategoryDTO.Response> getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Category not found with slug: " + slug));
        return ApiResponse.success("Category retrieved successfully", mapToResponse(category));
    }

    @Transactional
    public ApiResponse<CategoryDTO.Response> createCategory(CategoryDTO.Request request) {
        String slug = generateSlug(request.getName());
        if (categoryRepository.existsBySlug(slug)) {
            return ApiResponse.error("Category already exists", "CATEGORY_EXISTS");
        }

        Category category = Category.builder()
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .isActive(true)
                .build();

        Category saved = categoryRepository.save(category);
        return ApiResponse.success("Category created successfully", mapToResponse(saved));
    }

    private String generateSlug(String input) {
        return input.toLowerCase().replaceAll("[^a-z0-9]", "-").replaceAll("-+", "-").replaceAll("^-|-$", "");
    }

    private CategoryDTO.Response mapToResponse(Category category) {
        return CategoryDTO.Response.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .isActive(category.isActive())
                .displayOrder(category.getDisplayOrder())
                .build();
    }
}
