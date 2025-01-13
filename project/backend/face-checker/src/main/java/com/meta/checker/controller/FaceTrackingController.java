package com.meta.checker.controller;

import com.meta.checker.dtos.FaceTrackingDto;

import com.meta.checker.srevice.FaceTrackingService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/ac/face")
public class FaceTrackingController {

    private final FaceTrackingService faceTrackingService;

    public FaceTrackingController(FaceTrackingService faceTrackingService) {
        this.faceTrackingService = faceTrackingService;
    }

    @PostMapping("/track")
    public ResponseEntity<FaceTrackingDto> trackFace(
            @RequestParam("officeId") String officeId,
            @RequestParam("image") MultipartFile image) {
        FaceTrackingDto trackingDto = faceTrackingService.trackFace(officeId, image);
        return new ResponseEntity<>(trackingDto, HttpStatus.CREATED);
    }

    @GetMapping("/reports/{officeId}")
    public ResponseEntity<List<FaceTrackingDto>> getTrackingReports(
            @PathVariable String officeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<FaceTrackingDto> reports = faceTrackingService.getTrackingReports(officeId, startDate, endDate);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/{trackingId}")
    public ResponseEntity<FaceTrackingDto> getTrackingById(@PathVariable Long trackingId) {
        FaceTrackingDto tracking = faceTrackingService.getTrackingById(trackingId);
        return ResponseEntity.ok(tracking);
    }

    @GetMapping("/user/{userId}/office/{officeId}")
    public ResponseEntity<List<FaceTrackingDto>> getUserTrackingHistory(
            @PathVariable String userId,
            @PathVariable String officeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<FaceTrackingDto> history = faceTrackingService.getUserTrackingHistory(userId, officeId, startDate, endDate);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/today/{officeId}")
    public ResponseEntity<List<FaceTrackingDto>> getTodayTrackings(@PathVariable String officeId) {
        List<FaceTrackingDto> trackings = faceTrackingService.getTodayTrackings(officeId);
        return ResponseEntity.ok(trackings);
    }
}