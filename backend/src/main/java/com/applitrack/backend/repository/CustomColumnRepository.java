package com.applitrack.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.applitrack.backend.model.CustomColumn;

public interface CustomColumnRepository extends JpaRepository<CustomColumn, Long> {

    List<CustomColumn> findByUserId(Long userId);

    int countByUserId(Long userId);

    Optional<CustomColumn> findByIdAndUserId(Long id, Long userId);
}
