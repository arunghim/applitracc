package com.applitrack.backend.dto;

public class AppUserLoginResponseDto {

    private String token;
    private String refreshToken;
    private String email;
    private String firstName;
    private String lastName;

    public AppUserLoginResponseDto() {
    }

    public AppUserLoginResponseDto(String token, String refreshToken, String email, String firstName, String lastName) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
}
