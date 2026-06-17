package com.applitracc.backend.api;

import java.time.LocalDateTime;

public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private String error;
    private ErrorCode errorCode;
    private LocalDateTime timestamp;

    private ApiResponse(boolean success, String message, T data, String error, ErrorCode errorCode) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.error = error;
        this.errorCode = errorCode;
        this.timestamp = LocalDateTime.now();
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data, null, null);
    }

    public static <T> ApiResponse<T> error(String message, String error, ErrorCode errorCode) {
        return new ApiResponse<>(false, message, null, error, errorCode);
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public T getData() {
        return data;
    }

    public String getError() {
        return error;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}
