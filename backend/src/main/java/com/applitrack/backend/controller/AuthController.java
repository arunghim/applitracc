package com.applitrack.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.applitrack.backend.api.ApiResponse;
import com.applitrack.backend.api.ErrorCode;
import com.applitrack.backend.dto.AppUserAuthDto;
import com.applitrack.backend.dto.AppUserLoginResponseDto;
import com.applitrack.backend.dto.RefreshTokenRequestDto;
import com.applitrack.backend.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@RequestBody AppUserAuthDto appUserAuthDto) {
        String result = authService.registerAppUser(appUserAuthDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", result));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AppUserLoginResponseDto>> login(@RequestBody AppUserAuthDto appUserAuthDto) {
        AppUserLoginResponseDto response = authService.loginAppUser(appUserAuthDto);

        if (response.getToken() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Login failed", "Invalid username or password",
                            ErrorCode.UNAUTHORIZED_ACCESS));
        }

        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AppUserLoginResponseDto>> refresh(
            @RequestBody RefreshTokenRequestDto request) {
        AppUserLoginResponseDto response = authService.refreshAccessToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestBody RefreshTokenRequestDto request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }
}
