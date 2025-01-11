package com.meta.checker.controller;

import com.meta.checker.dtos.FaceTrackingDto;

import com.meta.checker.srevice.FaceTrackingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
}