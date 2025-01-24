package com.meta.checker.srevice;

import com.meta.checker.dtos.ScreenTrackingDto;

import java.time.LocalDateTime;
import java.util.List;

public interface ScreenTrackingService {
    ScreenTrackingDto trackScreen(String officeId, String userId, String screenDetails, Boolean doingAssignedTask);
    List<ScreenTrackingDto> getTrackingReports(String officeId, LocalDateTime startDate, LocalDateTime endDate);
    ScreenTrackingDto getTrackingById(Long trackingId);
    List<ScreenTrackingDto> getUserTrackingHistory(String userId, String officeId, LocalDateTime startDate, LocalDateTime endDate);
    List<ScreenTrackingDto> getTodayTrackings(String officeId);
}
