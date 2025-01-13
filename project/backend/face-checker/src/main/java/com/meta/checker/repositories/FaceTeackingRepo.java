package com.meta.checker.repositories;

import com.meta.checker.entities.FaceTracking;
import org.springframework.data.jpa.repository.JpaRepository;
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
}