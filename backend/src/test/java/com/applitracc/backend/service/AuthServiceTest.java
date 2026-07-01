package com.applitracc.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.applitracc.backend.dto.AppUserAuthDto;
import com.applitracc.backend.dto.AppUserLoginResponseDto;
import com.applitracc.backend.model.AppUser;
import com.applitracc.backend.model.RefreshToken;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserService userService;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private RefreshTokenService refreshTokenService;

    @InjectMocks
    private AuthService authService;

    private AppUser user;
    private AppUserAuthDto authDto;

    @BeforeEach
    void setUp() {
        user = new AppUser();
        user.setId(1L);
        user.setEmail("jane@example.com");
        user.setFirstName("Jane");
        user.setLastName("Doe");
        user.setPassword("hashed_password");

        authDto = new AppUserAuthDto();
        authDto.setEmail("jane@example.com");
        authDto.setPassword("secret123");
        authDto.setFirstName("Jane");
        authDto.setLastName("Doe");
    }

    // ──────────────────────────── register ──────────────────────────────

    @Test
    void register_newEmail_savesUserAndReturnsSuccessMessage() {
        when(userService.existsByEmail("jane@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("hashed_password");

        String result = authService.registerAppUser(authDto);

        assertThat(result).isEqualTo("User registered successfully");
        verify(userService).saveUser(any(AppUser.class));
    }

    @Test
    void register_duplicateEmail_returnsAlreadyExistsMessage() {
        when(userService.existsByEmail("jane@example.com")).thenReturn(true);

        String result = authService.registerAppUser(authDto);

        assertThat(result).isEqualTo("Email already exists");
        verify(userService, never()).saveUser(any());
    }

    // ──────────────────────────── login ─────────────────────────────────

    @Test
    void login_validCredentials_returnsTokens() {
        when(userService.getUserByEmail("jane@example.com")).thenReturn(user);
        when(passwordEncoder.matches("secret123", "hashed_password")).thenReturn(true);
        when(jwtService.generateToken("jane@example.com")).thenReturn("access.token");

        RefreshToken rt = new RefreshToken();
        rt.setToken("refresh.token");
        when(refreshTokenService.createRefreshToken(1L)).thenReturn(rt);

        AppUserLoginResponseDto response = authService.loginAppUser(authDto);

        assertThat(response.getToken()).isEqualTo("access.token");
        assertThat(response.getRefreshToken()).isEqualTo("refresh.token");
        assertThat(response.getEmail()).isEqualTo("jane@example.com");
        assertThat(response.getFirstName()).isEqualTo("Jane");
        assertThat(response.getLastName()).isEqualTo("Doe");
    }

    @Test
    void login_wrongPassword_returnsNullToken() {
        when(userService.getUserByEmail("jane@example.com")).thenReturn(user);
        when(passwordEncoder.matches("secret123", "hashed_password")).thenReturn(false);

        AppUserLoginResponseDto response = authService.loginAppUser(authDto);

        assertThat(response.getToken()).isNull();
        verify(jwtService, never()).generateToken(anyString());
    }

    @Test
    void login_unknownEmail_returnsNullToken() {
        when(userService.getUserByEmail("jane@example.com"))
                .thenThrow(new RuntimeException("User not found"));

        AppUserLoginResponseDto response = authService.loginAppUser(authDto);

        assertThat(response.getToken()).isNull();
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    // ──────────────────────────── refresh ───────────────────────────────

    @Test
    void refreshAccessToken_validToken_returnsNewTokens() {
        RefreshToken oldRt = new RefreshToken();
        oldRt.setToken("old.refresh");
        oldRt.setUser(user);

        RefreshToken newRt = new RefreshToken();
        newRt.setToken("new.refresh");

        when(refreshTokenService.validateRefreshToken("old.refresh")).thenReturn(oldRt);
        when(refreshTokenService.createRefreshToken(1L)).thenReturn(newRt);
        when(jwtService.generateToken("jane@example.com")).thenReturn("new.access");

        AppUserLoginResponseDto response = authService.refreshAccessToken("old.refresh");

        assertThat(response.getToken()).isEqualTo("new.access");
        assertThat(response.getRefreshToken()).isEqualTo("new.refresh");
    }

    // ──────────────────────────── logout ────────────────────────────────

    @Test
    void logout_validToken_revokesToken() {
        authService.logout("some.refresh.token");

        verify(refreshTokenService).revokeToken("some.refresh.token");
    }
}
