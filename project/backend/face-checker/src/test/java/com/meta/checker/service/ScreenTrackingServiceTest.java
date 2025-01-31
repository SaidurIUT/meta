package com.meta.checker.service;

import com.meta.checker.BaseIntegrationTest;
import com.meta.checker.dtos.ScreenTrackingDto;
import com.meta.checker.entities.ScreenTracking;
import com.meta.checker.repositories.ScreenTrackingRepo;
import com.meta.checker.srevice.impl.ScreenTrackingServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class ScreenTrackingServiceTest extends BaseIntegrationTest {

    @Autowired
    private ScreenTrackingServiceImpl screenTrackingService;

    @MockitoBean
    private ScreenTrackingRepo screenTrackingRepo;

    @Test
    void trackScreen_ShouldCreateNewScreenTracking() {
        String officeId = "office-1";
        String userId = "user-1";
        String screenDetails = "test details";
        Boolean doingAssignedTask = true;

        ScreenTracking tracking = new ScreenTracking();
        tracking.setOfficeId(officeId);
        tracking.setUserId(userId);
        tracking.setTrackedScreenDetails(screenDetails);
        tracking.setDoingAssignedTask(doingAssignedTask);
        tracking.setClickedAt(LocalDateTime.now());

        when(screenTrackingRepo.save(any(ScreenTracking.class))).thenReturn(tracking);

        ScreenTrackingDto result = screenTrackingService.trackScreen(officeId, userId, screenDetails, doingAssignedTask);

        assertNotNull(result);
        assertEquals(officeId, result.getOfficeId());
        assertEquals(userId, result.getUserId());
        assertEquals(screenDetails, result.getTrackedScreenDetails());
        assertEquals(doingAssignedTask, result.getDoingAssignedTask());
    }

    // Add more tests for other service methods
} 