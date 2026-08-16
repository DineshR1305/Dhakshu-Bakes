package com.dhakshubakes.controller;

import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.dto.ProductDTO;
import com.dhakshubakes.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductDTO.Response>>> searchAndFilterProducts(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean isEggless,
            @RequestParam(required = false) Boolean isFeatured,
            @RequestParam(required = false) Boolean isBestseller,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {

        return ResponseEntity.ok(productService.searchAndFilterProducts(
                query, category, isEggless, isFeatured, isBestseller, sort, minPrice, maxPrice
        ));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<ProductDTO.Response>> getProductBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(productService.getProductBySlug(slug));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<ProductDTO.Response>>> getFeatured() {
        return ResponseEntity.ok(productService.getFeaturedProducts());
    }

    @GetMapping("/bestsellers")
    public ResponseEntity<ApiResponse<List<ProductDTO.Response>>> getBestsellers() {
        return ResponseEntity.ok(productService.getBestsellerProducts());
    }

    @GetMapping("/seasonal")
    public ResponseEntity<ApiResponse<List<ProductDTO.Response>>> getSeasonal() {
        return ResponseEntity.ok(productService.getSeasonalProducts());
    }
}
