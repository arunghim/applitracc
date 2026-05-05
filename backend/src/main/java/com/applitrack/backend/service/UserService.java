package com.applitrack.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.applitrack.backend.api.ErrorCode;
import com.applitrack.backend.exception.ApiException;
import com.applitrack.backend.model.AppUser;
import com.applitrack.backend.repository.AppUserRepository;

@Service
public class UserService {

    private final AppUserRepository appUserRepository;

    public UserService(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    public AppUser getUserById(Long id) {
        throw new UnsupportedOperationException("Unimplemented method 'getUserById'");
    }

    public AppUser getUserByUsername(String username) {
        throw new UnsupportedOperationException("Unimplemented method 'getUserByUsername'");
    }

    public AppUser getUserByEmail(String email) {
        throw new UnsupportedOperationException("Unimplemented method 'getUserByEmail'");
    }

    public boolean existsByEmail(String email) {
        throw new UnsupportedOperationException("Unimplemented method 'existsByEmail'");
    }

    public boolean existsByUsername(String username) {
        throw new UnsupportedOperationException("Unimplemented method 'existsByUsername'");
    }

    public AppUser saveUser(AppUser appUser) {
        throw new UnsupportedOperationException("Unimplemented method 'saveUser'");
    }
}
