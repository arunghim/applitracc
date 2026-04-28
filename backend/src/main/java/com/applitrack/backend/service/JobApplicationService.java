package com.applitrack.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.applitrack.backend.api.ErrorCode;
import com.applitrack.backend.dto.JobApplicationDTO;
import com.applitrack.backend.exception.ApiException;
import com.applitrack.backend.mapper.JobApplicationMapper;
import com.applitrack.backend.model.AppUser;
import com.applitrack.backend.model.JobApplication;
import com.applitrack.backend.model.JobStatus;
import com.applitrack.backend.repository.AppUserRepository;
import com.applitrack.backend.repository.JobApplicationRepository;

@Service
@Transactional(readOnly = true)
public class JobApplicationService {

    private static final Logger log = LoggerFactory.getLogger(JobApplicationService.class);

    private final JobApplicationRepository jobApplicationRepository;
    private final AppUserRepository appUserRepository;

    public JobApplicationService(JobApplicationRepository jobApplicationRepository,
            AppUserRepository appUserRepository) {
        this.jobApplicationRepository = jobApplicationRepository;
        this.appUserRepository = appUserRepository;
    }

    @Transactional
    public JobApplicationDTO createJobApplication(Long userId, JobApplicationDTO dto) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND,
                "User not found with id: " + userId));

        JobApplication application = JobApplicationMapper.toEntity(dto);
        application.setUser(user);

        JobApplicationDTO saved = JobApplicationMapper.toDTO(jobApplicationRepository.save(application));
        log.info("Created application [{}] for user [{}]", saved.getId(), userId);
        return saved;
    }

    public JobApplicationDTO getJobApplication(Long userId, Long appId) {
        return JobApplicationMapper.toDTO(getOwnedApplication(userId, appId));
    }

    public Page<JobApplicationDTO> getAllJobApplications(
            Long userId,
            JobStatus status,
            String company,
            Pageable pageable) {

        Page<JobApplication> result;

        if (status != null && company != null && !company.isBlank()) {
            result = jobApplicationRepository
                    .findByUserIdAndStatusAndCompanyContainingIgnoreCase(userId, status, company, pageable);
        } else if (status != null) {
            result = jobApplicationRepository
                    .findByUserIdAndStatus(userId, status, pageable);
        } else if (company != null && !company.isBlank()) {
            result = jobApplicationRepository
                    .findByUserIdAndCompanyContainingIgnoreCase(userId, company, pageable);
        } else {
            result = jobApplicationRepository.findByUserId(userId, pageable);
        }

        return result.map(JobApplicationMapper::toDTO);
    }

    @Transactional
    public JobApplicationDTO updateApplication(Long userId, Long appId, JobApplicationDTO dto) {
        JobApplication application = getOwnedApplication(userId, appId);
        JobApplicationMapper.updateEntity(application, dto);
        return JobApplicationMapper.toDTO(jobApplicationRepository.save(application));
    }

    @Transactional
    public void deleteApplication(Long userId, Long appId) {
        JobApplication application = getOwnedApplication(userId, appId);
        jobApplicationRepository.delete(application);
        log.info("Deleted application [{}] for user [{}]", appId, userId);
    }

    private JobApplication getOwnedApplication(Long userId, Long appId) {
        return jobApplicationRepository.findByUserIdAndId(userId, appId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorCode.APPLICATION_NOT_FOUND,
                "Application not found with id: " + appId));
    }
}
