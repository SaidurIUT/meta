package com.meta.checker.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TrackingStatusDTO {

    private Boolean faceTrackingStatus;

    private Boolean canOfficeSeeFaceTracking;

    private Boolean activityTrackingStatus;

    private Boolean canOfficeSeeActivityTracking;

    private Boolean screenTrackingStatus;

    private Boolean canOfficeSeeScreenTracking;
}