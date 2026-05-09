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
        return appUserRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND,
                        "User not found with id: " + id));
    }

    public AppUser getUserByEmail(String email) {
        return appUserRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND,
                        "User not found with email: " + email));
    }

    public boolean existsByEmail(String email) {
        return appUserRepository.existsByEmail(email);
    }

    public AppUser saveUser(AppUser appUser) {
        return appUserRepository.save(appUser);
    }
}
