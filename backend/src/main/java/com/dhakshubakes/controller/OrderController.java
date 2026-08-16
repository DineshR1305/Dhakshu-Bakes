package com.dhakshubakes.controller;

import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.dto.OrderDTO;
import com.dhakshubakes.security.UserPrincipal;
import com.dhakshubakes.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderDTO.Response>> checkout(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody OrderDTO.CheckoutRequest request) {
        return ResponseEntity.ok(orderService.createOrderFromCart(userPrincipal, request));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<List<OrderDTO.Response>>> getMyOrders(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(orderService.getUserOrders(userPrincipal));
    }

    @GetMapping("/{orderNumber}")
    public ResponseEntity<ApiResponse<OrderDTO.Response>> getOrderByNumber(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String orderNumber) {
        return ResponseEntity.ok(orderService.getOrderByNumber(userPrincipal, orderNumber));
    }
}
