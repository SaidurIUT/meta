package com.meta.checker.controller;

import com.meta.checker.BaseIntegrationTest;
import com.meta.checker.entities.TrackingStatus;
import com.meta.checker.srevice.TrackingStatusService;
import com.meta.checker.utils.JwtUtil;
import org.junit.jupiter.api.Test;

import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;



import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class TrackingStatusControllerTest extends BaseIntegrationTest {

    @MockitoBean
    private TrackingStatusService trackingStatusService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @Test
    void createTrackingInfo_ShouldReturnCreatedStatus() throws Exception {
        String userId = "test-user";
        TrackingStatus trackingStatus = new TrackingStatus();
        trackingStatus.setUserId(userId);

        when(jwtUtil.getUserIdFromToken()).thenReturn(userId);
        when(trackingStatusService.createTrackingInfo(userId)).thenReturn(trackingStatus);

        mockMvc.perform(post("/ac/v1/status/create")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.userId").value(userId));
    }

    @Test
    void checkTrackingInfoExists_ShouldReturnTrue() throws Exception {
        String userId = "test-user";
        when(jwtUtil.getUserIdFromToken()).thenReturn(userId);
        when(trackingStatusService.existsByUserId(anyString())).thenReturn(true);

        mockMvc.perform(get("/ac/v1/status/exists"))
                .andExpect(status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$").value(true));
    }

    // Add more tests for other endpoints
} 