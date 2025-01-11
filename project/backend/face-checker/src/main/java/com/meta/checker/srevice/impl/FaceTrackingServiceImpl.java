package com.meta.checker.srevice.impl;


import com.meta.checker.dtos.FaceTrackingDto;
import com.meta.checker.entities.FaceTracking;
import com.meta.checker.repositories.FaceTeackingRepo;

import com.meta.checker.srevice.FaceTrackingService;
import com.meta.checker.srevice.FileService;
import com.meta.checker.srevice.ImageComparisonService;
import com.meta.checker.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class FaceTrackingServiceImpl implements FaceTrackingService {

    @Value("${project.track.image.path}")
    private String path;

    private final FileService fileService;
    private final ImageComparisonService imageComparisonService;
    private final FaceTeackingRepo faceTrackingRepo;
    private final JwtUtil jwtUtil;

    public FaceTrackingServiceImpl(FileService fileService,
                                   ImageComparisonService imageComparisonService,
                                   FaceTeackingRepo faceTrackingRepo,
                                   JwtUtil jwtUtil) {
        this.fileService = fileService;
        this.imageComparisonService = imageComparisonService;
        this.faceTrackingRepo = faceTrackingRepo;
        this.jwtUtil = jwtUtil;
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