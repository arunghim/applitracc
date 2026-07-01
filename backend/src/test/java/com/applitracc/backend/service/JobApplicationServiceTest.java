package com.applitracc.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.applitracc.backend.dto.JobApplicationDTO;
import com.applitracc.backend.exception.ApiException;
import com.applitracc.backend.model.AppUser;
import com.applitracc.backend.model.JobApplication;
import com.applitracc.backend.model.JobStatus;
import com.applitracc.backend.repository.CustomColumnRepository;
import com.applitracc.backend.repository.CustomColumnValueRepository;
import com.applitracc.backend.repository.JobApplicationRepository;

@ExtendWith(MockitoExtension.class)
class JobApplicationServiceTest {

    @Mock
    private JobApplicationRepository jobApplicationRepository;

    @Mock
    private CustomColumnRepository customColumnRepository;

    @Mock
    private CustomColumnValueRepository customColumnValueRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private JobApplicationService jobApplicationService;

    private AppUser user;
    private JobApplication application;
    private JobApplicationDTO dto;

    @BeforeEach
    void setUp() {
        user = new AppUser();
        user.setId(1L);
        user.setEmail("recruiter@acme.com");

        application = new JobApplication();
        application.setId(10L);
        application.setUser(user);
        application.setCompany("Acme Corp");
        application.setRole("Software Engineer");
        application.setStatus(JobStatus.APPLIED);
        application.setAppliedDate(LocalDate.of(2026, 6, 1));

        dto = new JobApplicationDTO();
        dto.setCompany("Acme Corp");
        dto.setRole("Software Engineer");
        dto.setStatus(JobStatus.APPLIED);
        dto.setAppliedDate(LocalDate.of(2026, 6, 1));
    }

    // ──────────────────────── createJobApplication ───────────────────────

    @Test
    void create_validDto_returnsCreatedApplication() {
        when(userService.getUserById(1L)).thenReturn(user);
        when(jobApplicationRepository.save(any(JobApplication.class))).thenReturn(application);
        when(customColumnRepository.findByUserId(1L)).thenReturn(Collections.emptyList());
        when(customColumnValueRepository.findByJobApplicationId(10L)).thenReturn(Collections.emptyList());

        JobApplicationDTO result = jobApplicationService.createJobApplication(1L, dto);

        assertThat(result.getCompany()).isEqualTo("Acme Corp");
        assertThat(result.getRole()).isEqualTo("Software Engineer");
        assertThat(result.getStatus()).isEqualTo(JobStatus.APPLIED);
        verify(jobApplicationRepository).save(any(JobApplication.class));
    }

    // ──────────────────────── getJobApplication ──────────────────────────

    @Test
    void getOne_ownedApplication_returnsDto() {
        when(jobApplicationRepository.findByUserIdAndId(1L, 10L))
                .thenReturn(Optional.of(application));
        when(customColumnValueRepository.findByJobApplicationId(10L))
                .thenReturn(Collections.emptyList());

        JobApplicationDTO result = jobApplicationService.getJobApplication(1L, 10L);

        assertThat(result.getId()).isEqualTo(10L);
        assertThat(result.getCompany()).isEqualTo("Acme Corp");
    }

    @Test
    void getOne_notOwned_throwsApiException() {
        when(jobApplicationRepository.findByUserIdAndId(1L, 99L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> jobApplicationService.getJobApplication(1L, 99L))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Application not found");
    }

    // ──────────────────────── getAllJobApplications ───────────────────────

    @Test
    void getAll_noFilters_returnsAllUserApplications() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<JobApplication> page = new PageImpl<>(List.of(application));

        when(jobApplicationRepository.findByUserId(1L, pageable)).thenReturn(page);
        when(customColumnValueRepository.findByJobApplicationId(10L))
                .thenReturn(Collections.emptyList());

        Page<JobApplicationDTO> result = jobApplicationService
                .getAllJobApplications(1L, null, null, pageable);

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getCompany()).isEqualTo("Acme Corp");
    }

    @Test
    void getAll_filterByStatus_queriesCorrectRepository() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<JobApplication> page = new PageImpl<>(List.of(application));

        when(jobApplicationRepository.findByUserIdAndStatus(1L, JobStatus.APPLIED, pageable))
                .thenReturn(page);
        when(customColumnValueRepository.findByJobApplicationId(10L))
                .thenReturn(Collections.emptyList());

        Page<JobApplicationDTO> result = jobApplicationService
                .getAllJobApplications(1L, JobStatus.APPLIED, null, pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getStatus()).isEqualTo(JobStatus.APPLIED);
    }

    @Test
    void getAll_filterByCompany_queriesCorrectRepository() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<JobApplication> page = new PageImpl<>(List.of(application));

        when(jobApplicationRepository.findByUserIdAndCompanyContainingIgnoreCase(1L, "Acme", pageable))
                .thenReturn(page);
        when(customColumnValueRepository.findByJobApplicationId(10L))
                .thenReturn(Collections.emptyList());

        Page<JobApplicationDTO> result = jobApplicationService
                .getAllJobApplications(1L, null, "Acme", pageable);

        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void getAll_filterByStatusAndCompany_queriesCorrectRepository() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<JobApplication> page = new PageImpl<>(List.of(application));

        when(jobApplicationRepository.findByUserIdAndStatusAndCompanyContainingIgnoreCase(
                1L, JobStatus.APPLIED, "Acme", pageable)).thenReturn(page);
        when(customColumnValueRepository.findByJobApplicationId(10L))
                .thenReturn(Collections.emptyList());

        Page<JobApplicationDTO> result = jobApplicationService
                .getAllJobApplications(1L, JobStatus.APPLIED, "Acme", pageable);

        assertThat(result.getContent()).hasSize(1);
    }

    // ──────────────────────── updateApplication ──────────────────────────

    @Test
    void update_ownedApplication_updatesAndReturnsDto() {
        dto.setRole("Senior Engineer");
        dto.setStatus(JobStatus.INTERVIEW);

        when(jobApplicationRepository.findByUserIdAndId(1L, 10L))
                .thenReturn(Optional.of(application));
        when(jobApplicationRepository.save(application)).thenReturn(application);
        when(customColumnValueRepository.findByJobApplicationId(10L))
                .thenReturn(Collections.emptyList());

        JobApplicationDTO result = jobApplicationService.updateApplication(1L, 10L, dto);

        assertThat(result.getRole()).isEqualTo("Senior Engineer");
        assertThat(result.getStatus()).isEqualTo(JobStatus.INTERVIEW);
    }

    @Test
    void update_notOwned_throwsApiException() {
        when(jobApplicationRepository.findByUserIdAndId(1L, 99L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> jobApplicationService.updateApplication(1L, 99L, dto))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Application not found");
    }

    // ──────────────────────── deleteApplication ───────────────────────────

    @Test
    void delete_ownedApplication_deletesIt() {
        when(jobApplicationRepository.findByUserIdAndId(1L, 10L))
                .thenReturn(Optional.of(application));

        jobApplicationService.deleteApplication(1L, 10L);

        verify(jobApplicationRepository).delete(application);
    }

    @Test
    void delete_notOwned_throwsApiException() {
        when(jobApplicationRepository.findByUserIdAndId(1L, 99L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> jobApplicationService.deleteApplication(1L, 99L))
                .isInstanceOf(ApiException.class);
    }
}
