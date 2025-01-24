package com.meta.checker.controller;

import com.meta.checker.dtos.ScreenTrackingDto;
import com.meta.checker.srevice.ScreenTrackingService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/ac/v1/screen")
public class ScreenTrackingController {

    private final ScreenTrackingService screenTrackingService;

    public ScreenTrackingController(ScreenTrackingService screenTrackingService) {
        this.screenTrackingService = screenTrackingService;
    }

    @PostMapping("/track")
    @Operation(summary = "Track screen activity with screen details, office ID, user ID, and assigned task status")
    public ResponseEntity<ScreenTrackingDto> trackScreen(
            @RequestParam("officeId") String officeId,
            @RequestParam("userId") String userId,
            @RequestParam("screenDetails") String screenDetails,
            @RequestParam("doingAssignedTask") Boolean doingAssignedTask) {
        ScreenTrackingDto trackingDto = screenTrackingService.trackScreen(officeId, userId, screenDetails, doingAssignedTask);
        return new ResponseEntity<>(trackingDto, HttpStatus.CREATED);
    }


    @GetMapping("/reports/{officeId}")
    @Operation(summary = "Get screen tracking reports between given dates for a specific office")
    public ResponseEntity<List<ScreenTrackingDto>> getTrackingReports(
            @PathVariable String officeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<ScreenTrackingDto> reports = screenTrackingService.getTrackingReports(officeId, startDate, endDate);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/{trackingId}")
    @Operation(summary = "Get screen tracking by ID")
    public ResponseEntity<ScreenTrackingDto> getTrackingById(@PathVariable Long trackingId) {
        ScreenTrackingDto tracking = screenTrackingService.getTrackingById(trackingId);
        return ResponseEntity.ok(tracking);
    }

    @GetMapping("/user/{userId}/office/{officeId}")
    @Operation(summary = "Get user screen tracking history between given dates")
    public ResponseEntity<List<ScreenTrackingDto>> getUserTrackingHistory(
            @PathVariable String userId,
            @PathVariable String officeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<ScreenTrackingDto> history = screenTrackingService.getUserTrackingHistory(userId, officeId, startDate, endDate);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/today/{officeId}")
    @Operation(summary = "Get today's screen trackings for a specific office")
    public ResponseEntity<List<ScreenTrackingDto>> getTodayTrackings(@PathVariable String officeId) {
        List<ScreenTrackingDto> trackings = screenTrackingService.getTodayTrackings(officeId);
        return ResponseEntity.ok(trackings);
    }
}