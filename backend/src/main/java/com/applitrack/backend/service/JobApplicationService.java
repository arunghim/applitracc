package com.applitrack.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.applitrack.backend.dto.JobApplicationDTO;
import com.applitrack.backend.mapper.JobApplicationMapper;
import com.applitrack.backend.model.AppUser;
import com.applitrack.backend.model.JobApplication;
import com.applitrack.backend.repository.AppUserRepository;
import com.applitrack.backend.repository.JobApplicationRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final AppUserRepository appUserRepository;

    public JobApplicationService(JobApplicationRepository jobApplicationRepository,
            AppUserRepository appUserRepository) {
        this.jobApplicationRepository = jobApplicationRepository;
        this.appUserRepository = appUserRepository;
    }

    // CREATE
    public JobApplicationDTO createJobApplication(Long userId, JobApplicationDTO dto) {

        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        JobApplication application = JobApplicationMapper.toEntity(dto);
        application.setUser(user);

        return JobApplicationMapper.toDTO(jobApplicationRepository.save(application));
    }

    // GET ONE
    public JobApplicationDTO getJobApplication(Long userId, Long appId) {

        JobApplication application = jobApplicationRepository.findById(appId)
                .orElseThrow(() -> new EntityNotFoundException("JobApplication not found with id: " + appId));

        if (!application.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Application does not belong to user");
        }

        return JobApplicationMapper.toDTO(application);
    }

    // GET ALL
    public List<JobApplicationDTO> getAllJobApplications(Long userId) {
        return jobApplicationRepository.findByUserId(userId)
                .stream()
                .map(JobApplicationMapper::toDTO)
                .toList();
    }

    // UPDATE
    public JobApplicationDTO updateApplication(Long userId, Long appId, JobApplicationDTO dto) {

        JobApplication existing = jobApplicationRepository.findById(appId)
                .orElseThrow(() -> new EntityNotFoundException("JobApplication not found with id: " + appId));

        if (!existing.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Application does not belong to user");
        }

        existing.setCompany(dto.getCompany());
        existing.setRole(dto.getRole());
        existing.setSalary(dto.getSalary());
        existing.setStatus(dto.getStatus());
        existing.setNotes(dto.getNotes());
        existing.setLink(dto.getLink());
        existing.setAppliedDate(dto.getAppliedDate());

        return JobApplicationMapper.toDTO(jobApplicationRepository.save(existing));
    }

    // DELETE
    public void deleteApplication(Long userId, Long appId) {

        JobApplication application = jobApplicationRepository.findById(appId)
                .orElseThrow(() -> new EntityNotFoundException("JobApplication not found with id: " + appId));

        if (!application.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Application does not belong to user");
        }

        jobApplicationRepository.delete(application);
    }
}
