package com.dhakshubakes.controller;

import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.dto.CartDTO;
import com.dhakshubakes.security.UserPrincipal;
import com.dhakshubakes.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartDTO.Response>> getCart(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId) {
        return ResponseEntity.ok(cartService.getOrCreateCart(userPrincipal, sessionId));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartDTO.Response>> addItem(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @RequestBody CartDTO.AddRequest request) {
        return ResponseEntity.ok(cartService.addItemToCart(userPrincipal, sessionId, request));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartDTO.Response>> updateItem(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @PathVariable Long itemId,
            @RequestBody CartDTO.UpdateRequest request) {
        return ResponseEntity.ok(cartService.updateItemQuantity(userPrincipal, sessionId, itemId, request));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartDTO.Response>> removeItem(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @PathVariable Long itemId) {
        return ResponseEntity.ok(cartService.removeItem(userPrincipal, sessionId, itemId));
    }

    @PostMapping("/merge")
    public ResponseEntity<ApiResponse<CartDTO.Response>> mergeCart(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId) {
        return ResponseEntity.ok(cartService.mergeGuestCartToUserCart(userPrincipal, sessionId));
    }
}
