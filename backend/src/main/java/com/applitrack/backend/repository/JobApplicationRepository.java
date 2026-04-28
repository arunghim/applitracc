package com.applitrack.backend.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.applitrack.backend.model.JobApplication;
import com.applitrack.backend.model.JobStatus;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    Page<JobApplication> findByUserId(Long userId, Pageable pageable);

    Optional<JobApplication> findByUserIdAndId(Long userId, Long id);

    Page<JobApplication> findByUserIdAndStatus(Long userId, JobStatus status, Pageable pageable);

    Page<JobApplication> findByUserIdAndCompanyContainingIgnoreCase(Long userId, String company, Pageable pageable);

    Page<JobApplication> findByUserIdAndStatusAndCompanyContainingIgnoreCase(
            Long userId,
            JobStatus status,
            String company,
            Pageable pageable);
}
