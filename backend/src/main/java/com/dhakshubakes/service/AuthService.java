package com.dhakshubakes.service;

import com.dhakshubakes.dto.ApiResponse;
import com.dhakshubakes.dto.AuthDTO;
import com.dhakshubakes.entity.Role;
import com.dhakshubakes.entity.User;
import com.dhakshubakes.repository.UserRepository;
import com.dhakshubakes.security.JwtTokenProvider;
import com.dhakshubakes.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    // Password rule: min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special char
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
    );

    @Transactional
    public ApiResponse<AuthDTO.JwtAuthResponse> registerUser(AuthDTO.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ApiResponse.error("Email is already in use", "EMAIL_ALREADY_EXISTS");
        }

        if (request.getPassword() == null || !PASSWORD_PATTERN.matcher(request.getPassword()).matches()) {
            return ApiResponse.error(
                    "Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).",
                    "WEAK_PASSWORD"
            );
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.ROLE_CUSTOMER)
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        AuthDTO.UserDTO userDTO = mapToUserDTO(savedUser);
        AuthDTO.JwtAuthResponse authResponse = AuthDTO.JwtAuthResponse.builder()
                .accessToken(jwt)
                .user(userDTO)
                .build();

        return ApiResponse.success("Registration successful", authResponse);
    }

    public ApiResponse<AuthDTO.JwtAuthResponse> loginUser(AuthDTO.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        AuthDTO.UserDTO userDTO = mapToUserDTO(user);
        AuthDTO.JwtAuthResponse authResponse = AuthDTO.JwtAuthResponse.builder()
                .accessToken(jwt)
                .user(userDTO)
                .build();

        return ApiResponse.success("Login successful", authResponse);
    }

    public ApiResponse<AuthDTO.UserDTO> getCurrentUser(UserPrincipal currentUser) {
        if (currentUser == null) {
            return ApiResponse.error("User not authenticated", "UNAUTHORIZED");
        }

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ApiResponse.success("Current user fetched successfully", mapToUserDTO(user));
    }

    @Transactional
    public ApiResponse<AuthDTO.UserDTO> updateUserProfile(UserPrincipal currentUser, AuthDTO.UpdateProfileRequest request) {
        if (currentUser == null) {
            return ApiResponse.error("User not authenticated", "UNAUTHORIZED");
        }

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFullName(request.getFullName().trim());
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);

        User saved = userRepository.save(user);
        return ApiResponse.success("Profile updated successfully", mapToUserDTO(saved));
    }

    private AuthDTO.UserDTO mapToUserDTO(User user) {
        return AuthDTO.UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .build();
    }
}
