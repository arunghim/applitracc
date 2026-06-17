package com.applitracc.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.applitracc.backend.api.ErrorCode;
import com.applitracc.backend.dto.CustomColumnDTO;
import com.applitracc.backend.exception.ApiException;
import com.applitracc.backend.model.AppUser;
import com.applitracc.backend.model.CustomColumn;
import com.applitracc.backend.model.CustomColumnValue;
import com.applitracc.backend.model.JobApplication;
import com.applitracc.backend.repository.CustomColumnRepository;
import com.applitracc.backend.repository.CustomColumnValueRepository;
import com.applitracc.backend.repository.JobApplicationRepository;

@Service
@Transactional(readOnly = true)
public class CustomColumnService {

    private static final int MAX_COLUMNS = 5;

    private final CustomColumnRepository customColumnRepository;
    private final CustomColumnValueRepository customColumnValueRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final UserService userService;

    public CustomColumnService(CustomColumnRepository customColumnRepository,
            CustomColumnValueRepository customColumnValueRepository,
            JobApplicationRepository jobApplicationRepository,
            UserService userService) {
        this.customColumnRepository = customColumnRepository;
        this.customColumnValueRepository = customColumnValueRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.userService = userService;
    }

    public List<CustomColumnDTO> getColumns(Long userId) {
        return customColumnRepository.findByUserId(userId).stream()
                .map(col -> new CustomColumnDTO(col.getId(), col.getName(), col.getCreatedAt()))
                .collect(Collectors.toList());
    }

    @Transactional
    public CustomColumnDTO addColumn(Long userId, String name) {
        if (customColumnRepository.countByUserId(userId) >= MAX_COLUMNS) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.MAX_COLUMNS_EXCEEDED,
                    "Maximum of " + MAX_COLUMNS + " custom columns allowed");
        }

        AppUser user = userService.getUserById(userId);
        CustomColumn col = new CustomColumn();
        col.setUser(user);
        col.setName(name);
        CustomColumn saved = customColumnRepository.save(col);

        
        List<JobApplication> apps = jobApplicationRepository.findAllByUserId(userId);
        for (JobApplication app : apps) {
            CustomColumnValue ccv = new CustomColumnValue();
            ccv.setJobApplication(app);
            ccv.setCustomColumn(saved);
            ccv.setValue(null);
            customColumnValueRepository.save(ccv);
        }

        return new CustomColumnDTO(saved.getId(), saved.getName(), saved.getCreatedAt());
    }

    @Transactional
    public void deleteColumn(Long userId, Long columnId) {
        CustomColumn col = customColumnRepository.findByIdAndUserId(columnId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorCode.COLUMN_NOT_FOUND,
                        "Column not found with id: " + columnId));
        customColumnRepository.delete(col);
    }
}
