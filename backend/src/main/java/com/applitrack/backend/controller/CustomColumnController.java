package com.applitrack.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.applitrack.backend.api.ApiResponse;
import com.applitrack.backend.dto.CustomColumnDTO;
import com.applitrack.backend.service.CustomColumnService;
import com.applitrack.backend.service.UserService;

@RestController
@RequestMapping("/api/columns")
public class CustomColumnController {

    private final CustomColumnService customColumnService;
    private final UserService userService;

    public CustomColumnController(CustomColumnService customColumnService, UserService userService) {
        this.customColumnService = customColumnService;
        this.userService = userService;
    }

    private Long getAuthenticatedUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.getUserByEmail(email).getId();
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomColumnDTO>>> getColumns() {
        return ResponseEntity.ok(
                ApiResponse.success("Columns retrieved", customColumnService.getColumns(getAuthenticatedUserId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomColumnDTO>> addColumn(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        CustomColumnDTO created = customColumnService.addColumn(getAuthenticatedUserId(), name);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Column created", created));
    }

    @DeleteMapping("/{columnId}")
    public ResponseEntity<Void> deleteColumn(@PathVariable Long columnId) {
        customColumnService.deleteColumn(getAuthenticatedUserId(), columnId);
        return ResponseEntity.noContent().build();
    }
}
