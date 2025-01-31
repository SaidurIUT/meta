package com.meta.checker.controller;

import com.meta.checker.BaseIntegrationTest;
import com.meta.checker.dtos.FaceTrackingDto;
import com.meta.checker.srevice.FaceTrackingService;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;


import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class FaceTrackingControllerTest extends BaseIntegrationTest {

    @MockitoBean
    private FaceTrackingService faceTrackingService;

    @Test
    void trackFace_ShouldReturnCreatedStatus() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "image",
                "test.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );

        FaceTrackingDto trackingDto = FaceTrackingDto.builder()
                .id(1L)
                .officeId("office-1")
                .userId("user-1")
                .isPresent(true)
                .build();

        when(faceTrackingService.trackFace(anyString(), any())).thenReturn(trackingDto);

        mockMvc.perform(multipart("/ac/v1/face/track")
                        .file(file)
                        .param("officeId", "office-1"))
                .andExpect(status().isCreated())
                .andExpect(MockMvcResultMatchers.jsonPath("$.id").value(1L))
                .andExpect(MockMvcResultMatchers.jsonPath("$.officeId").value("office-1"));
    }

    // Add more tests for other endpoints
} 