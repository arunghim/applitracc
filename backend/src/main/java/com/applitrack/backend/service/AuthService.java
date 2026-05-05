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
        if (userService.existsByUsername(appUserAuthDto.getUsername())) {
            return "Username already exists";
        }
        if (userService.existsByEmail(appUserAuthDto.getEmail())) {
            return "Email already exists";
        }

        AppUser appUser = new AppUser();
        appUser.setUsername(appUserAuthDto.getUsername());
        appUser.setEmail(appUserAuthDto.getEmail());
        appUser.setPassword(passwordEncoder.encode(appUserAuthDto.getPassword()));

        userService.saveUser(appUser);

        return "User registered successfully";
    }

    public AppUserLoginResponseDto loginAppUser(AppUserAuthDto appUserAuthDto) {
        AppUser appUser;

        try {
            appUser = userService.getUserByUsername(appUserAuthDto.getUsername());
        } catch (Exception e) {
            return new AppUserLoginResponseDto("Invalid username or password", null);
        }

        if (!passwordEncoder.matches(appUserAuthDto.getPassword(), appUser.getPassword())) {
            return new AppUserLoginResponseDto("Invalid username or password", null);
        }

        String token = jwtService.generateToken(appUser.getUsername());
        return new AppUserLoginResponseDto("Login successful", token);
    }
}