package com.applitrack.backend.mapper;

import com.applitrack.backend.dto.JobApplicationDTO;
import com.applitrack.backend.model.JobApplication;

public class JobApplicationMapper {

    public static JobApplicationDTO toDTO(JobApplication application) {
        JobApplicationDTO dto = new JobApplicationDTO();
        dto.setId(application.getId());
        dto.setCompany(application.getCompany());
        dto.setRole(application.getRole());
        dto.setSalary(application.getSalary());
        dto.setStatus(application.getStatus());
        dto.setNotes(application.getNotes());
        dto.setLink(application.getLink());
        dto.setAppliedDate(application.getAppliedDate());
        return dto;
    }

    public static JobApplication toEntity(JobApplicationDTO dto) {
        JobApplication application = new JobApplication();
        application.setCompany(dto.getCompany());
        application.setRole(dto.getRole());
        application.setSalary(dto.getSalary());
        application.setStatus(dto.getStatus());
        application.setNotes(dto.getNotes());
        application.setLink(dto.getLink());
        application.setAppliedDate(dto.getAppliedDate());
        return application;
    }
}
