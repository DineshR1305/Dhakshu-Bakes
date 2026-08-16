package com.dhakshubakes.controller;

import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.dto.AddressDTO;
import com.dhakshubakes.security.UserPrincipal;
import com.dhakshubakes.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressDTO.Response>>> getUserAddresses(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(addressService.getUserAddresses(userPrincipal));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AddressDTO.Response>> createAddress(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody AddressDTO.Request request) {
        return ResponseEntity.ok(addressService.createAddress(userPrincipal, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressDTO.Response>> updateAddress(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody AddressDTO.Request request) {
        return ResponseEntity.ok(addressService.updateAddress(userPrincipal, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        return ResponseEntity.ok(addressService.deleteAddress(userPrincipal, id));
    }

    @PutMapping("/{id}/set-default")
    public ResponseEntity<ApiResponse<AddressDTO.Response>> setDefaultAddress(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        return ResponseEntity.ok(addressService.setDefaultAddress(userPrincipal, id));
    }
}
