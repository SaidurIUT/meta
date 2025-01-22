package com.meta.checker.repositories;

import com.meta.checker.entities.TrackingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TrackingStatusRepository extends JpaRepository<TrackingStatus, Long> {

    Optional<TrackingStatus> findByUserId(String userId);
    boolean existsByUserId(String userId);
}
