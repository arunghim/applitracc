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
        throw new UnsupportedOperationException("Unimplemented method 'register'");
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AppUserLoginResponseDto>> login(@RequestBody AppUserAuthDto appUserAuthDto) {
        throw new UnsupportedOperationException("Unimplemented method 'login'");
    }
}
