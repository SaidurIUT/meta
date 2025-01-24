package com.meta.checker.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ScreenTrackingDto {
    private Long id;
    private String officeId;
    private String userId;
    private Boolean doingAssignedTask;
    private String trackedScreenDetails;
    private LocalDateTime clickedAt;
}