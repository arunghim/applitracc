package com.applitracc.backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.applitracc.backend.dto.AppUserAuthDto;
import com.applitracc.backend.dto.AppUserLoginResponseDto;
import com.applitracc.backend.model.AppUser;
import com.applitracc.backend.model.RefreshToken;

@Service
public class AuthService {

    private final UserService userService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;

    public AuthService(UserService userService, JwtService jwtService, PasswordEncoder passwordEncoder,
            RefreshTokenService refreshTokenService) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenService = refreshTokenService;
    }

    public String registerAppUser(AppUserAuthDto appUserAuthDto) {
        if (userService.existsByEmail(appUserAuthDto.getEmail())) {
            return "Email already exists";
        }

        AppUser appUser = new AppUser();
        appUser.setFirstName(appUserAuthDto.getFirstName());
        appUser.setLastName(appUserAuthDto.getLastName());
        appUser.setEmail(appUserAuthDto.getEmail());
        appUser.setPassword(passwordEncoder.encode(appUserAuthDto.getPassword()));

        userService.saveUser(appUser);

        return "User registered successfully";
    }

    public AppUserLoginResponseDto loginAppUser(AppUserAuthDto appUserAuthDto) {
        AppUser appUser;

        try {
            appUser = userService.getUserByEmail(appUserAuthDto.getEmail());
        } catch (Exception e) {
            return new AppUserLoginResponseDto(null, null, null, null, null);
        }

        if (!passwordEncoder.matches(appUserAuthDto.getPassword(), appUser.getPassword())) {
            return new AppUserLoginResponseDto(null, null, null, null, null);
        }

        String accessToken = jwtService.generateToken(appUser.getEmail());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(appUser.getId());
        return new AppUserLoginResponseDto(accessToken, refreshToken.getToken(),
                appUser.getEmail(), appUser.getFirstName(), appUser.getLastName());
    }

    public AppUserLoginResponseDto refreshAccessToken(String refreshTokenStr) {
        RefreshToken refreshToken = refreshTokenService.validateRefreshToken(refreshTokenStr);
        AppUser user = refreshToken.getUser();

        
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user.getId());
        String newAccessToken = jwtService.generateToken(user.getEmail());
        return new AppUserLoginResponseDto(newAccessToken, newRefreshToken.getToken(),
                user.getEmail(), user.getFirstName(), user.getLastName());
    }

    public void logout(String refreshTokenStr) {
        refreshTokenService.revokeToken(refreshTokenStr);
    }
}