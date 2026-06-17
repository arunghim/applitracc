package com.applitracc.backend.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.applitracc.backend.api.ErrorCode;
import com.applitracc.backend.dto.JobApplicationDTO;
import com.applitracc.backend.exception.ApiException;
import com.applitracc.backend.mapper.JobApplicationMapper;
import com.applitracc.backend.model.AppUser;
import com.applitracc.backend.model.CustomColumn;
import com.applitracc.backend.model.CustomColumnValue;
import com.applitracc.backend.model.JobApplication;
import com.applitracc.backend.model.JobStatus;
import com.applitracc.backend.repository.CustomColumnRepository;
import com.applitracc.backend.repository.CustomColumnValueRepository;
import com.applitracc.backend.repository.JobApplicationRepository;

@Service
@Transactional(readOnly = true)
public class JobApplicationService {

    private static final Logger log = LoggerFactory.getLogger(JobApplicationService.class);

    private final JobApplicationRepository jobApplicationRepository;
    private final CustomColumnRepository customColumnRepository;
    private final CustomColumnValueRepository customColumnValueRepository;
    private final UserService userService;

    public JobApplicationService(JobApplicationRepository jobApplicationRepository,
            CustomColumnRepository customColumnRepository,
            CustomColumnValueRepository customColumnValueRepository,
            UserService userService) {
        this.jobApplicationRepository = jobApplicationRepository;
        this.customColumnRepository = customColumnRepository;
        this.customColumnValueRepository = customColumnValueRepository;
        this.userService = userService;
    }

    @Transactional
    public JobApplicationDTO createJobApplication(Long userId, JobApplicationDTO dto) {
        AppUser user = userService.getUserById(userId);

        JobApplication application = JobApplicationMapper.toEntity(dto);
        application.setUser(user);
        JobApplication saved = jobApplicationRepository.save(application);

        List<CustomColumn> userColumns = customColumnRepository.findByUserId(userId);
        for (CustomColumn col : userColumns) {
            String val = dto.getCustomValues() != null ? dto.getCustomValues().get(col.getId()) : null;
            CustomColumnValue ccv = new CustomColumnValue();
            ccv.setJobApplication(saved);
            ccv.setCustomColumn(col);
            ccv.setValue(val);
            customColumnValueRepository.save(ccv);
        }

        JobApplicationDTO result = JobApplicationMapper.toDTO(saved);
        result.setCustomValues(buildCustomValuesMap(saved.getId()));
        log.info("Created application [{}] for user [{}]", saved.getId(), userId);
        return result;
    }

    public JobApplicationDTO getJobApplication(Long userId, Long appId) {
        JobApplication app = getOwnedApplication(userId, appId);
        JobApplicationDTO dto = JobApplicationMapper.toDTO(app);
        dto.setCustomValues(buildCustomValuesMap(app.getId()));
        return dto;
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

        return result.map(app -> {
            JobApplicationDTO dto = JobApplicationMapper.toDTO(app);
            dto.setCustomValues(buildCustomValuesMap(app.getId()));
            return dto;
        });
    }

    @Transactional
    public JobApplicationDTO updateApplication(Long userId, Long appId, JobApplicationDTO dto) {
        JobApplication application = getOwnedApplication(userId, appId);
        JobApplicationMapper.updateEntity(application, dto);
        jobApplicationRepository.save(application);

        if (dto.getCustomValues() != null) {
            for (Map.Entry<Long, String> entry : dto.getCustomValues().entrySet()) {
                customColumnValueRepository
                        .findByJobApplicationIdAndCustomColumnId(application.getId(), entry.getKey())
                        .ifPresent(ccv -> {
                            ccv.setValue(entry.getValue());
                            customColumnValueRepository.save(ccv);
                        });
            }
        }

        JobApplicationDTO result = JobApplicationMapper.toDTO(application);
        result.setCustomValues(buildCustomValuesMap(application.getId()));
        return result;
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

    private Map<Long, String> buildCustomValuesMap(Long appId) {
        return customColumnValueRepository.findByJobApplicationId(appId).stream()
                .collect(Collectors.toMap(
                        ccv -> ccv.getCustomColumn().getId(),
                        ccv -> ccv.getValue() != null ? ccv.getValue() : ""));
    }
}
