package com.meta.checker.repositories;

import com.meta.checker.entities.ScreenTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ScreenTrackingRepo extends JpaRepository<ScreenTracking, Long> {
    List<ScreenTracking> findByOfficeIdAndClickedAtBetween(
            String officeId,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    List<ScreenTracking> findByUserIdAndOfficeIdAndClickedAtBetween(
            String userId,
            String officeId,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    @Query("SELECT st FROM ScreenTracking st WHERE st.userId = :userId AND st.officeId = :officeId AND st.clickedAt BETWEEN :startDate AND :endDate")
    List<ScreenTracking> findByUserIdAndOfficeIdAndDateRange(
            @Param("userId") String userId,
            @Param("officeId") String officeId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}