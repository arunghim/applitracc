package com.applitrack.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.applitrack.backend.dto.JobApplicationDTO;
import com.applitrack.backend.service.JobApplicationService;

@RestController
@RequestMapping("/api/users/{userId}/applications")
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    public JobApplicationController(JobApplicationService jobApplicationService) {
        this.jobApplicationService = jobApplicationService;
    }

    @PostMapping
    public ResponseEntity<JobApplicationDTO> create(
            @PathVariable Long userId,
            @RequestBody JobApplicationDTO dto) {

        return ResponseEntity.ok(jobApplicationService.createJobApplication(userId, dto));
    }

    @GetMapping("/{appId}")
    public ResponseEntity<JobApplicationDTO> getOne(
            @PathVariable Long userId,
            @PathVariable Long appId) {

        return ResponseEntity.ok(jobApplicationService.getJobApplication(userId, appId));
    }

    @GetMapping
    public ResponseEntity<List<JobApplicationDTO>> getAll(
            @PathVariable Long userId) {

        return ResponseEntity.ok(jobApplicationService.getAllJobApplications(userId));
    }

    @PutMapping("/{appId}")
    public ResponseEntity<JobApplicationDTO> update(
            @PathVariable Long userId,
            @PathVariable Long appId,
            @RequestBody JobApplicationDTO dto) {

        return ResponseEntity.ok(jobApplicationService.updateApplication(userId, appId, dto));
    }

    @DeleteMapping("/{appId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long userId,
            @PathVariable Long appId) {

        jobApplicationService.deleteApplication(userId, appId);
        return ResponseEntity.noContent().build();
    }
}
