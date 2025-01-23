package com.meta.checker.srevice.impl;

import com.meta.checker.client.OfficeClient;
import com.meta.checker.dtos.FaceTrackingDto;
import com.meta.checker.dtos.FaceTrackingStatisticsDto;
import com.meta.checker.entities.FaceTracking;
import com.meta.checker.repositories.FaceTeackingRepo;
import com.meta.checker.srevice.FaceTrackingService;
import com.meta.checker.srevice.FileService;
import com.meta.checker.srevice.ImageComparisonService;
import com.meta.checker.utils.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class FaceTrackingServiceImpl implements FaceTrackingService {

    @Value("${project.track.image.path}")
    private String path;

    private final FileService fileService;
    private final ImageComparisonService imageComparisonService;
    private final FaceTeackingRepo faceTrackingRepo;
    private final JwtUtil jwtUtil;
    private final OfficeClient officeClient;

    public FaceTrackingServiceImpl(FileService fileService,
                                   ImageComparisonService imageComparisonService,
                                   FaceTeackingRepo faceTrackingRepo,
                                   JwtUtil jwtUtil,
                                   OfficeClient officeClient) {
        this.fileService = fileService;
        this.imageComparisonService = imageComparisonService;
        this.faceTrackingRepo = faceTrackingRepo;
        this.jwtUtil = jwtUtil;
        this.officeClient = officeClient;
    }

    @Override
    public FaceTrackingDto trackFace(String officeId, MultipartFile image) {
        try {
            // Get current user from JWT
            String currentUserId = jwtUtil.getUserIdFromToken();

            // Compare faces using ImageComparisonService
            boolean isPresent = imageComparisonService.compareImages(currentUserId, image);

            // Upload the image
            String fileName = fileService.uploadImage(path, image);
//            String imageUrl = path + "/" + fileName;

            // Create and save FaceTracking entity
            FaceTracking faceTracking = new FaceTracking();
            faceTracking.setOfficeId(officeId);
            faceTracking.setUserId(currentUserId);
            faceTracking.setIsPresent(isPresent);
            faceTracking.setImageUrl(fileName);
            faceTracking.setClickedAt(LocalDateTime.now());

            FaceTracking savedTracking = faceTrackingRepo.save(faceTracking);

            // Convert to DTO and return
            return convertToDto(savedTracking);
        } catch (Exception e) {
            throw new RuntimeException("Error processing face tracking request", e);
        }
    }

    @Override
    public List<FaceTrackingDto> getTrackingReports(String officeId, LocalDateTime startDate, LocalDateTime endDate) {
        String currentUserId = getCurrentUserAndValidate();
        validateOfficeAccess(officeId, currentUserId);

        List<FaceTracking> trackings = faceTrackingRepo.findByOfficeIdAndClickedAtBetween(
                officeId, startDate, endDate);

        return trackings.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public FaceTrackingDto getTrackingById(Long trackingId) {
        String currentUserId = getCurrentUserAndValidate();

        FaceTracking tracking = faceTrackingRepo.findById(trackingId)
                .orElseThrow(() -> new IllegalArgumentException("Tracking not found: " + trackingId));

        validateOfficeAccess(tracking.getOfficeId(), currentUserId);

        return convertToDto(tracking);
    }

    @Override
    public List<FaceTrackingDto> getUserTrackingHistory(String userId, String officeId, LocalDateTime startDate, LocalDateTime endDate) {
        String currentUserId = getCurrentUserAndValidate();
        validateOfficeAccess(officeId, currentUserId);

        if (!currentUserId.equals(userId) || !canAccessUserData(officeId, currentUserId)) {
            throw new RuntimeException("User does not have access to this data");
        }

        List<FaceTracking> trackings = faceTrackingRepo.findByUserIdAndOfficeIdAndClickedAtBetween(
                userId, officeId, startDate, endDate);

        return trackings.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<FaceTrackingDto> getTodayTrackings(String officeId) {
        String currentUserId = getCurrentUserAndValidate();
        validateOfficeAccess(officeId, currentUserId);

        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);

        List<FaceTracking> trackings = faceTrackingRepo.findByOfficeIdAndClickedAtBetween(
                officeId, startOfDay, endOfDay);

        return trackings.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public FaceTrackingStatisticsDto getUserTrackingStatistics(String officeId, StatisticPeriod period) {
        String currentUserId = getCurrentUserAndValidate();
        validateOfficeAccess(officeId, currentUserId);

        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate;

        switch (period) {
            case DAY:
                startDate = endDate.minusDays(1);
                break;
            case WEEK:
                startDate = endDate.minusWeeks(1);
                break;
            case MONTH:
                startDate = endDate.minusMonths(1);
                break;
            default:
                throw new IllegalArgumentException("Invalid period");
        }

        List<FaceTracking> trackings = faceTrackingRepo.findByUserIdAndOfficeIdAndDateRange(
                currentUserId, officeId, startDate, endDate
        );

        int totalAttempts = trackings.size();
        int presentAttempts = (int) trackings.stream()
                .filter(FaceTracking::getIsPresent)
                .count();

        double presentPercentage = totalAttempts > 0
                ? (double) presentAttempts / totalAttempts * 100
                : 0.0;

        return FaceTrackingStatisticsDto.builder()
                .totalAttempts(totalAttempts)
                .presentAttempts(presentAttempts)
                .presentPercentage(presentPercentage)
                .build();
    }

    private String getCurrentUserAndValidate() {
        String currentUserId = jwtUtil.getUserIdFromToken();
        if (currentUserId == null) {
            throw new RuntimeException("Error getting current user from token");
        }
        return currentUserId;
    }

    private void validateOfficeAccess(String officeId, String userId) {
        if (!officeClient.canAlterOffice(officeId, userId)) {
            throw new RuntimeException("User does not have access to this office");
        }
    }

    private boolean canAccessUserData(String officeId, String userId) {
        return officeClient.canAlterOffice(officeId, userId);
    }

    private void validateImageFormat(MultipartFile image) {
        try {
            BufferedImage bufferedImage = ImageIO.read(new ByteArrayInputStream(image.getBytes()));
            if (bufferedImage == null) {
                throw new IllegalArgumentException("Invalid image format");
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Error validating image format", e);
        }
    }

    private FaceTrackingDto convertToDto(FaceTracking entity) {
        return FaceTrackingDto.builder()
                .id(entity.getId())
                .officeId(entity.getOfficeId())
                .userId(entity.getUserId())
                .isPresent(entity.getIsPresent())
                .imageUrl(entity.getImageUrl())
                .clickedAt(entity.getClickedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .build();
    }
}