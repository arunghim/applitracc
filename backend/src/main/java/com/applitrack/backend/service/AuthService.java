package com.applitrack.backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.applitrack.backend.dto.AppUserAuthDto;
import com.applitrack.backend.dto.AppUserLoginResponseDto;
import com.applitrack.backend.model.AppUser;

@Service
public class AuthService {

    private final UserService userService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserService userService, JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public String registerAppUser(AppUserAuthDto appUserAuthDto) {
        throw new UnsupportedOperationException("Unimplemented method 'registerAppUser'");
    }

    public AppUserLoginResponseDto loginAppUser(AppUserAuthDto appUserAuthDto) {
        throw new UnsupportedOperationException("Unimplemented method 'loginAppUser'");
    }
}