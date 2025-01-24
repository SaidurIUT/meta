package com.meta.checker.srevice.impl;
import com.meta.checker.dtos.ScreenTrackingDto;
import com.meta.checker.entities.ScreenTracking;
import com.meta.checker.repositories.ScreenTrackingRepo;
import com.meta.checker.srevice.ScreenTrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScreenTrackingServiceImpl implements ScreenTrackingService {
    private final ScreenTrackingRepo screenTrackingRepo;

    @Override
    public ScreenTrackingDto trackScreen(String officeId, String userId, String screenDetails, Boolean doingAssignedTask) {
        ScreenTracking screenTracking = new ScreenTracking();
        screenTracking.setOfficeId(officeId);
        screenTracking.setUserId(userId);
        screenTracking.setClickedAt(LocalDateTime.now());
        screenTracking.setTrackedScreenDetails(screenDetails);
        screenTracking.setDoingAssignedTask(doingAssignedTask);

        ScreenTracking savedTracking = screenTrackingRepo.save(screenTracking);
        return convertToDto(savedTracking);
    }

    @Override
    public List<ScreenTrackingDto> getTrackingReports(String officeId, LocalDateTime startDate, LocalDateTime endDate) {
        return screenTrackingRepo.findByOfficeIdAndClickedAtBetween(officeId, startDate, endDate)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ScreenTrackingDto getTrackingById(Long trackingId) {
        return convertToDto(screenTrackingRepo.findById(trackingId)
                .orElseThrow(() -> new RuntimeException("Tracking not found")));
    }

    @Override
    public List<ScreenTrackingDto> getUserTrackingHistory(String userId, String officeId, LocalDateTime startDate, LocalDateTime endDate) {
        return screenTrackingRepo.findByUserIdAndOfficeIdAndDateRange(userId, officeId, startDate, endDate)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ScreenTrackingDto> getTodayTrackings(String officeId) {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
        return screenTrackingRepo.findByOfficeIdAndClickedAtBetween(officeId, startOfDay, endOfDay)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private ScreenTrackingDto convertToDto(ScreenTracking screenTracking) {
        ScreenTrackingDto dto = new ScreenTrackingDto();
        dto.setId(screenTracking.getId());
        dto.setOfficeId(screenTracking.getOfficeId());
        dto.setUserId(screenTracking.getUserId());
        dto.setDoingAssignedTask(screenTracking.getDoingAssignedTask());
        dto.setTrackedScreenDetails(screenTracking.getTrackedScreenDetails());
        dto.setClickedAt(screenTracking.getClickedAt());
        return dto;
    }
}