package com.meta.checker.controller;

import com.meta.checker.dtos.FaceTrackingDto;

import com.meta.checker.dtos.FaceTrackingStatisticsDto;
import com.meta.checker.srevice.FaceTrackingService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/ac/v1/face")
public class FaceTrackingController {

    private final FaceTrackingService faceTrackingService;

    public FaceTrackingController(FaceTrackingService faceTrackingService) {
        this.faceTrackingService = faceTrackingService;
    }

    @PostMapping("/track")
    @Operation(summary = "From the client side, user image will be sent with token and officeId. Then the image will be compared with the reference image of the user and the result will be saved in the database.")
    public ResponseEntity<FaceTrackingDto> trackFace(
            @RequestParam("officeId") String officeId,
            @RequestParam("image") MultipartFile image) {
        FaceTrackingDto trackingDto = faceTrackingService.trackFace(officeId, image);
        return new ResponseEntity<>(trackingDto, HttpStatus.CREATED);
    }

    @GetMapping("/reports/{officeId}")
    @Operation(summary = "Get tracking reports between the given dates of a specific office. It can be used by the admin and moderators.")
    public ResponseEntity<List<FaceTrackingDto>> getTrackingReports(
            @PathVariable String officeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<FaceTrackingDto> reports = faceTrackingService.getTrackingReports(officeId, startDate, endDate);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/{trackingId}")
    @Operation(summary = "Get tracking by ID. It can be used by the admin and moderators and the user itself.")
    public ResponseEntity<FaceTrackingDto> getTrackingById(@PathVariable Long trackingId) {
        FaceTrackingDto tracking = faceTrackingService.getTrackingById(trackingId);
        return ResponseEntity.ok(tracking);
    }

    @GetMapping("/user/{userId}/office/{officeId}")
    @Operation(summary = "Get user tracking history between the given dates of a specific office. It can be used by the admin and moderators.")
    public ResponseEntity<List<FaceTrackingDto>> getUserTrackingHistory(
            @PathVariable String userId,
            @PathVariable String officeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<FaceTrackingDto> history = faceTrackingService.getUserTrackingHistory(userId, officeId, startDate, endDate);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/today/{officeId}")
    @Operation(summary = "Get today's tracking of a specific office. It can be used by the admin and moderators.")
    public ResponseEntity<List<FaceTrackingDto>> getTodayTrackings(@PathVariable String officeId) {
        List<FaceTrackingDto> trackings = faceTrackingService.getTodayTrackings(officeId);
        return ResponseEntity.ok(trackings);
    }


    @GetMapping("/statistics/{officeId}")
    @Operation(summary = "Get user tracking statistics for a specific period")
    public ResponseEntity<FaceTrackingStatisticsDto> getUserTrackingStatistics(
            @PathVariable String officeId,
            @RequestParam FaceTrackingService.StatisticPeriod period) {
        FaceTrackingStatisticsDto statistics = faceTrackingService.getUserTrackingStatistics(officeId, period);
        return ResponseEntity.ok(statistics);
    }

}