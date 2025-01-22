package com.meta.checker.entities;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TrackingStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId;

    private Boolean faceTrackingStatus;

    private Boolean canOfficeSeeFaceTracking;

    private Boolean activityTrackingStatus;

    private Boolean canOfficeSeeActivityTracking;

    private Boolean screenTrackingStatus;

    private Boolean canOfficeSeeScreenTracking;

}
