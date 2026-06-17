package com.applitracc.backend.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.applitracc.backend.api.ApiResponse;
import com.applitracc.backend.dto.JobApplicationDTO;
import com.applitracc.backend.model.JobStatus;
import com.applitracc.backend.service.JobApplicationService;
import com.applitracc.backend.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;
    private final UserService userService;

    public JobApplicationController(JobApplicationService jobApplicationService, UserService userService) {
        this.jobApplicationService = jobApplicationService;
        this.userService = userService;
    }

    private Long getAuthenticatedUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.getUserByEmail(email).getId();
    }

    @PostMapping
    public ResponseEntity<ApiResponse<JobApplicationDTO>> create(
            @Valid @RequestBody JobApplicationDTO dto) {

        JobApplicationDTO created = jobApplicationService.createJobApplication(getAuthenticatedUserId(), dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Application created", created));
    }

    @GetMapping("/{appId}")
    public ResponseEntity<ApiResponse<JobApplicationDTO>> getOne(
            @PathVariable Long appId) {

        return ResponseEntity.ok(
                ApiResponse.success("Application retrieved",
                        jobApplicationService.getJobApplication(getAuthenticatedUserId(), appId)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<JobApplicationDTO>>> getAll(
            @RequestParam(required = false) JobStatus status,
            @RequestParam(required = false) String company,
            Pageable pageable) {

        return ResponseEntity.ok(
                ApiResponse.success("Applications retrieved",
                        jobApplicationService.getAllJobApplications(getAuthenticatedUserId(), status, company,
                                pageable)));
    }

    @PutMapping("/{appId}")
    public ResponseEntity<ApiResponse<JobApplicationDTO>> update(
            @PathVariable Long appId,
            @Valid @RequestBody JobApplicationDTO dto) {

        return ResponseEntity.ok(
                ApiResponse.success("Application updated",
                        jobApplicationService.updateApplication(getAuthenticatedUserId(), appId, dto)));
    }

    @DeleteMapping("/{appId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long appId) {

        jobApplicationService.deleteApplication(getAuthenticatedUserId(), appId);
        return ResponseEntity.noContent().build();
    }
}
