package com.meta.checker.srevice;

import com.meta.checker.dtos.FaceTrackingDto;
import com.meta.checker.dtos.FaceTrackingStatisticsDto;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
import java.util.List;

public interface FaceTrackingService {
    FaceTrackingDto trackFace(String officeId, MultipartFile image);
    List<FaceTrackingDto> getTrackingReports(String officeId, LocalDateTime startDate, LocalDateTime endDate);
    FaceTrackingDto getTrackingById(Long trackingId);
    List<FaceTrackingDto> getUserTrackingHistory(String userId, String officeId, LocalDateTime startDate, LocalDateTime endDate);
    List<FaceTrackingDto> getTodayTrackings(String officeId);
    FaceTrackingStatisticsDto getUserTrackingStatistics(
            String officeId,
            StatisticPeriod period
    );

    enum StatisticPeriod {
        DAY, WEEK, MONTH
    }

}