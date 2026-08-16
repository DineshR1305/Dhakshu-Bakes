package com.dhakshubakes.controller;

import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.dto.AuthDTO;
import com.dhakshubakes.security.UserPrincipal;
import com.dhakshubakes.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthDTO.JwtAuthResponse>> register(@Valid @RequestBody AuthDTO.RegisterRequest request) {
        ApiResponse<AuthDTO.JwtAuthResponse> response = authService.registerUser(request);
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthDTO.JwtAuthResponse>> login(@Valid @RequestBody AuthDTO.LoginRequest request) {
        ApiResponse<AuthDTO.JwtAuthResponse> response = authService.loginUser(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthDTO.UserDTO>> getCurrentUser(@AuthenticationPrincipal UserPrincipal currentUser) {
        ApiResponse<AuthDTO.UserDTO> response = authService.getCurrentUser(currentUser);
        return ResponseEntity.ok(response);
    }
}
