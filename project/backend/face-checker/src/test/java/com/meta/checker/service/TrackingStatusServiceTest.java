package com.meta.checker.service;

import com.meta.checker.BaseIntegrationTest;
import com.meta.checker.entities.TrackingStatus;
import com.meta.checker.repositories.TrackingStatusRepository;
import com.meta.checker.srevice.impl.TrackingStatusServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class TrackingStatusServiceTest extends BaseIntegrationTest {

    @Autowired
    private TrackingStatusServiceImpl trackingStatusService;

    @MockitoBean
    private TrackingStatusRepository trackingStatusRepository;

    @Test
    void createTrackingInfo_ShouldCreateNewTrackingStatus() {
        String userId = "test-user";
        TrackingStatus trackingStatus = new TrackingStatus();
        trackingStatus.setUserId(userId);

        when(trackingStatusRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(trackingStatusRepository.save(any(TrackingStatus.class))).thenReturn(trackingStatus);

        TrackingStatus result = trackingStatusService.createTrackingInfo(userId);

        assertNotNull(result);
        assertEquals(userId, result.getUserId());
    }

    // Add more tests for other service methods
} 