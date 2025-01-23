package com.meta.checker.repositories;

import com.meta.checker.entities.FaceTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface FaceTeackingRepo extends JpaRepository<FaceTracking, Long> {
    List<FaceTracking> findByOfficeIdAndClickedAtBetween(
            String officeId,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    List<FaceTracking> findByUserIdAndOfficeIdAndClickedAtBetween(
            String userId,
            String officeId,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    @Query("SELECT ft FROM FaceTracking ft WHERE ft.userId = :userId AND ft.officeId = :officeId AND ft.clickedAt BETWEEN :startDate AND :endDate")
    List<FaceTracking> findByUserIdAndOfficeIdAndDateRange(
            @Param("userId") String userId,
            @Param("officeId") String officeId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}