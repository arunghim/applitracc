package com.applitracc.backend.controller;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.applitracc.backend.api.ApiResponse;
import com.applitracc.backend.api.ErrorCode;
import com.applitracc.backend.dto.AppUserAuthDto;
import com.applitracc.backend.dto.AppUserLoginResponseDto;
import com.applitracc.backend.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.cookie.same-site:Lax}")
    private String cookieSameSite;

    @Value("${jwt.refresh-expiration:604800000}")
    private long refreshExpirationMs;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    private ResponseCookie buildRefreshCookie(String value, long maxAgeSeconds) {
        return ResponseCookie.from("refreshToken", value)
                .httpOnly(true)
                .path("/api/auth")
                .maxAge(Duration.ofSeconds(maxAgeSeconds))
                .sameSite(cookieSameSite)
                .secure(cookieSecure)
                .build();
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

        ResponseCookie cookie = buildRefreshCookie(response.getRefreshToken(), refreshExpirationMs / 1000);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AppUserLoginResponseDto>> refresh(
            @CookieValue(name = "refreshToken", required = false) String refreshToken) {
        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Refresh failed", "No refresh token cookie",
                            ErrorCode.REFRESH_TOKEN_INVALID));
        }
        AppUserLoginResponseDto response = authService.refreshAccessToken(refreshToken);
        ResponseCookie cookie = buildRefreshCookie(response.getRefreshToken(), refreshExpirationMs / 1000);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.success("Token refreshed", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(name = "refreshToken", required = false) String refreshToken) {
        if (refreshToken != null) {
            authService.logout(refreshToken);
        }
        ResponseCookie cleared = buildRefreshCookie("", 0);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cleared.toString())
                .body(ApiResponse.success("Logged out successfully", null));
    }
}
