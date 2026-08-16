package com.dhakshubakes.controller;

import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.dto.WishlistDTO;
import com.dhakshubakes.security.UserPrincipal;
import com.dhakshubakes.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<ApiResponse<WishlistDTO.Response>> getWishlist(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(wishlistService.getWishlist(userPrincipal));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<ApiResponse<WishlistDTO.Response>> addProduct(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long productId) {
        return ResponseEntity.ok(wishlistService.addProductToWishlist(userPrincipal, productId));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<WishlistDTO.Response>> removeProduct(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long productId) {
        return ResponseEntity.ok(wishlistService.removeProductFromWishlist(userPrincipal, productId));
    }
}
