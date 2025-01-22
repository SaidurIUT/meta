package com.meta.checker.srevice.impl;

import com.meta.checker.entities.TrackingStatus;
import com.meta.checker.repositories.TrackingStatusRepository;
import com.meta.checker.srevice.TrackingStatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class TrackingStatusServiceImpl implements TrackingStatusService {

    @Autowired
    private TrackingStatusRepository trackingStatusRepository;

    @Override
    public TrackingStatus createTrackingInfo(String userId) {
        if (trackingStatusRepository.findByUserId(userId).isPresent()) {
            throw new IllegalStateException("Tracking info already exists for this user");
        }

        TrackingStatus trackingStatus = new TrackingStatus();
        trackingStatus.setUserId(userId);
        trackingStatus.setFaceTrackingStatus(false);
        trackingStatus.setCanOfficeSeeFaceTracking(false);
        trackingStatus.setActivityTrackingStatus(false);
        trackingStatus.setCanOfficeSeeActivityTracking(false);
        trackingStatus.setScreenTrackingStatus(false);
        trackingStatus.setCanOfficeSeeScreenTracking(false);

        return trackingStatusRepository.save(trackingStatus);
    }

    @Override
    public void deleteTrackingInfo(String userId) {
        TrackingStatus trackingStatus = trackingStatusRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Tracking info not found"));
        trackingStatusRepository.delete(trackingStatus);
    }

    @Override
    public boolean existsByUserId(String userId) {
        return trackingStatusRepository.findByUserId(userId).isPresent();
    }

    @Override
    public Optional<TrackingStatus> getTrackingInfoByUserId(String userId) {
        return trackingStatusRepository.findByUserId(userId);
    }

    @Override
    public TrackingStatus changeFaceTrackingStatus(String userId) {
        TrackingStatus trackingStatus = trackingStatusRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Tracking info not found"));
        trackingStatus.setFaceTrackingStatus(!trackingStatus.getFaceTrackingStatus());
        return trackingStatusRepository.save(trackingStatus);
    }

    @Override
    public TrackingStatus changeCanOfficeSeeFaceTracking(String userId) {
        TrackingStatus trackingStatus = trackingStatusRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Tracking info not found"));
        trackingStatus.setCanOfficeSeeFaceTracking(!trackingStatus.getCanOfficeSeeFaceTracking());
        return trackingStatusRepository.save(trackingStatus);
    }

    @Override
    public TrackingStatus changeActivityTrackingStatus(String userId) {
        TrackingStatus trackingStatus = trackingStatusRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Tracking info not found"));
        trackingStatus.setActivityTrackingStatus(!trackingStatus.getActivityTrackingStatus());
        return trackingStatusRepository.save(trackingStatus);
    }

    @Override
    public TrackingStatus changeCanOfficeSeeActivityTracking(String userId) {
        TrackingStatus trackingStatus = trackingStatusRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Tracking info not found"));
        trackingStatus.setCanOfficeSeeActivityTracking(!trackingStatus.getCanOfficeSeeActivityTracking());
        return trackingStatusRepository.save(trackingStatus);
    }

    @Override
    public TrackingStatus changeScreenTrackingStatus(String userId) {
        TrackingStatus trackingStatus = trackingStatusRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Tracking info not found"));
        trackingStatus.setScreenTrackingStatus(!trackingStatus.getScreenTrackingStatus());
        return trackingStatusRepository.save(trackingStatus);
    }

    @Override
    public TrackingStatus changeCanOfficeSeeScreenTracking(String userId) {
        TrackingStatus trackingStatus = trackingStatusRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Tracking info not found"));
        trackingStatus.setCanOfficeSeeScreenTracking(!trackingStatus.getCanOfficeSeeScreenTracking());
        return trackingStatusRepository.save(trackingStatus);
    }
}