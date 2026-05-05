package com.applitrack.backend.service;

import java.util.Date;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    public String generateToken(String username) {
        throw new UnsupportedOperationException("Unimplemented method 'generateToken'");
    }

    public String extractUsername(String token) {
        throw new UnsupportedOperationException("Unimplemented method 'extractUsername'");
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        throw new UnsupportedOperationException("Unimplemented method 'isTokenValid'");
    }

    private boolean isTokenExpired(String token) {
        throw new UnsupportedOperationException("Unimplemented method 'isTokenExpired'");
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        throw new UnsupportedOperationException("Unimplemented method 'extractClaim'");
    }

    private SecretKey getSigningKey() {
        throw new UnsupportedOperationException("Unimplemented method 'getSigningKey'");
    }
}
