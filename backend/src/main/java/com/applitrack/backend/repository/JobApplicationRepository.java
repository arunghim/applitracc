package com.applitrack.backend.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.applitrack.backend.model.JobApplication;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    Page<JobApplication> findByUserId(Long userId, Pageable pageable);

    List<JobApplication> findByCompany(String company);

    List<JobApplication> findByStatus(String status);
}
