package com.meta.checker.srevice;


import com.meta.checker.entities.TrackingStatus;
import java.util.Optional;

public interface TrackingStatusService {

    TrackingStatus createTrackingInfo(String userId);

    void deleteTrackingInfo(String userId);

    boolean existsByUserId(String userId);

    Optional<TrackingStatus> getTrackingInfoByUserId(String userId);

    TrackingStatus changeFaceTrackingStatus(String userId);

    TrackingStatus changeCanOfficeSeeFaceTracking(String userId);

    TrackingStatus changeActivityTrackingStatus(String userId);

    TrackingStatus changeCanOfficeSeeActivityTracking(String userId);

    TrackingStatus changeScreenTrackingStatus(String userId);

    TrackingStatus changeCanOfficeSeeScreenTracking(String userId);
}