package com.applitracc.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.applitracc.backend.model.CustomColumnValue;

public interface CustomColumnValueRepository extends JpaRepository<CustomColumnValue, Long> {

    List<CustomColumnValue> findByJobApplicationId(Long jobApplicationId);

    Optional<CustomColumnValue> findByJobApplicationIdAndCustomColumnId(Long jobApplicationId, Long customColumnId);
}
