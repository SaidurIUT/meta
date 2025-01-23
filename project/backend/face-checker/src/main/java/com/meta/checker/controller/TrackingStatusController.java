package com.meta.checker.controller;

import com.meta.checker.entities.TrackingStatus;
import com.meta.checker.srevice.TrackingStatusService;
import com.meta.checker.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ac/v1/status")
public class TrackingStatusController {

    @Autowired
    private TrackingStatusService trackingStatusService;

    @Autowired
    private JwtUtil jwtUtil;

    private String getUserIdFromToken() {
        return jwtUtil.getUserIdFromToken();
    }

    @PostMapping("/create")
    public ResponseEntity<TrackingStatus> createTrackingInfo() {
        String userId = getUserIdFromToken();
        TrackingStatus trackingStatus = trackingStatusService.createTrackingInfo(userId);
        return ResponseEntity.ok(trackingStatus);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteTrackingInfo() {
        String userId = getUserIdFromToken();
        trackingStatusService.deleteTrackingInfo(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/exists")
    public ResponseEntity<Boolean> checkTrackingInfoExists() {
        String userId = getUserIdFromToken();
        boolean exists = trackingStatusService.existsByUserId(userId);
        return ResponseEntity.ok(exists);
    }

    // Modify existing endpoints to create tracking info if it doesn't exist
    private TrackingStatus getOrCreateTrackingInfo(String userId) {
        return trackingStatusService.getTrackingInfoByUserId(userId)
                .orElseGet(() -> trackingStatusService.createTrackingInfo(userId));
    }

    // Endpoint to get the current status of tracking
    @GetMapping("/getTrackingStatus")
    public ResponseEntity<TrackingStatus> getTrackingStatus() {
        String userId = getUserIdFromToken();
        TrackingStatus trackingStatus = trackingStatusService.getTrackingInfoByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Tracking info not found"));
        return ResponseEntity.ok(trackingStatus);
    }

    // Endpoint to change the face tracking status (toggle)
    @PutMapping("/changeFaceTrackingStatus")
    public ResponseEntity<TrackingStatus> changeFaceTrackingStatus() {
        String userId = getUserIdFromToken();
        TrackingStatus trackingStatus = trackingStatusService.changeFaceTrackingStatus(userId);
        return ResponseEntity.ok(trackingStatus);
    }

    // Endpoint to get the current status of office visibility for face tracking
    @GetMapping("/getCanOfficeSeeFaceTracking")
    public ResponseEntity<Boolean> getCanOfficeSeeFaceTracking() {
        String userId = getUserIdFromToken();
        TrackingStatus trackingStatus = trackingStatusService.getTrackingInfoByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Tracking info not found"));
        return ResponseEntity.ok(trackingStatus.getCanOfficeSeeFaceTracking());
    }

    // Endpoint to change the office visibility status for face tracking (toggle)
    @PutMapping("/changeCanOfficeSeeFaceTracking")
    public ResponseEntity<TrackingStatus> changeCanOfficeSeeFaceTracking() {
        String userId = getUserIdFromToken();
        TrackingStatus trackingStatus = trackingStatusService.changeCanOfficeSeeFaceTracking(userId);
        return ResponseEntity.ok(trackingStatus);
    }

    // Endpoint to get the current status of activity tracking
    @GetMapping("/getActivityTrackingStatus")
    public ResponseEntity<Boolean> getActivityTrackingStatus() {
        String userId = getUserIdFromToken();
        TrackingStatus trackingStatus = trackingStatusService.getTrackingInfoByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Tracking info not found"));
        return ResponseEntity.ok(trackingStatus.getActivityTrackingStatus());
    }

    // Endpoint to change the activity tracking status (toggle)
    @PutMapping("/changeActivityTrackingStatus")
    public ResponseEntity<TrackingStatus> changeActivityTrackingStatus() {
        String userId = getUserIdFromToken();
        TrackingStatus trackingStatus = trackingStatusService.changeActivityTrackingStatus(userId);
        return ResponseEntity.ok(trackingStatus);
    }

    // Endpoint to get the current status of office visibility for activity tracking
    @GetMapping("/getCanOfficeSeeActivityTracking")
    public ResponseEntity<Boolean> getCanOfficeSeeActivityTracking() {
        String userId = getUserIdFromToken();
        TrackingStatus trackingStatus = trackingStatusService.getTrackingInfoByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Tracking info not found"));
        return ResponseEntity.ok(trackingStatus.getCanOfficeSeeActivityTracking());
    }

    // Endpoint to change the office visibility status for activity tracking (toggle)
    @PutMapping("/changeCanOfficeSeeActivityTracking")
    public ResponseEntity<TrackingStatus> changeCanOfficeSeeActivityTracking() {
        String userId = getUserIdFromToken();
        TrackingStatus trackingStatus = trackingStatusService.changeCanOfficeSeeActivityTracking(userId);
        return ResponseEntity.ok(trackingStatus);
    }

    // Endpoint to get the current status of screen tracking
    @GetMapping("/getScreenTrackingStatus")
    public ResponseEntity<Boolean> getScreenTrackingStatus() {
        String userId = getUserIdFromToken();
        TrackingStatus trackingStatus = trackingStatusService.getTrackingInfoByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Tracking info not found"));
        return ResponseEntity.ok(trackingStatus.getScreenTrackingStatus());
    }

    // Endpoint to change the screen tracking status (toggle)
    @PutMapping("/changeScreenTrackingStatus")
    public ResponseEntity<TrackingStatus> changeScreenTrackingStatus() {
        String userId = getUserIdFromToken();
        TrackingStatus trackingStatus = trackingStatusService.changeScreenTrackingStatus(userId);
        return ResponseEntity.ok(trackingStatus);
    }

    // Endpoint to get the current status of office visibility for screen tracking
    @GetMapping("/getCanOfficeSeeScreenTracking")
    public ResponseEntity<Boolean> getCanOfficeSeeScreenTracking() {
        String userId = getUserIdFromToken();
        TrackingStatus trackingStatus = trackingStatusService.getTrackingInfoByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Tracking info not found"));
        return ResponseEntity.ok(trackingStatus.getCanOfficeSeeScreenTracking());
    }

    // Endpoint to change the office visibility status for screen tracking (toggle)
    @PutMapping("/changeCanOfficeSeeScreenTracking")
    public ResponseEntity<TrackingStatus> changeCanOfficeSeeScreenTracking() {
        String userId = getUserIdFromToken();
        TrackingStatus trackingStatus = trackingStatusService.changeCanOfficeSeeScreenTracking(userId);
        return ResponseEntity.ok(trackingStatus);
    }
}
