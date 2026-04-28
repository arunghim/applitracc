package com.applitrack.backend.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.applitrack.backend.api.ApiResponse;
import com.applitrack.backend.dto.JobApplicationDTO;
import com.applitrack.backend.model.JobStatus;
import com.applitrack.backend.service.JobApplicationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users/{userId}/applications")
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    public JobApplicationController(JobApplicationService jobApplicationService) {
        this.jobApplicationService = jobApplicationService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<JobApplicationDTO>> create(
            @PathVariable Long userId,
            @Valid @RequestBody JobApplicationDTO dto) {

        JobApplicationDTO created = jobApplicationService.createJobApplication(userId, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Application created", created));
    }

    @GetMapping("/{appId}")
    public ResponseEntity<ApiResponse<JobApplicationDTO>> getOne(
            @PathVariable Long userId,
            @PathVariable Long appId) {

        return ResponseEntity.ok(
                ApiResponse.success("Application retrieved", jobApplicationService.getJobApplication(userId, appId)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<JobApplicationDTO>>> getAll(
            @PathVariable Long userId,
            @RequestParam(required = false) JobStatus status,
            @RequestParam(required = false) String company,
            Pageable pageable) {

        return ResponseEntity.ok(
                ApiResponse.success("Applications retrieved",
                        jobApplicationService.getAllJobApplications(userId, status, company, pageable)));
    }

    @PutMapping("/{appId}")
    public ResponseEntity<ApiResponse<JobApplicationDTO>> update(
            @PathVariable Long userId,
            @PathVariable Long appId,
            @Valid @RequestBody JobApplicationDTO dto) {

        return ResponseEntity.ok(
                ApiResponse.success("Application updated", jobApplicationService.updateApplication(userId, appId, dto)));
    }

    @DeleteMapping("/{appId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long userId,
            @PathVariable Long appId) {

        jobApplicationService.deleteApplication(userId, appId);
        return ResponseEntity.noContent().build();
    }
}
