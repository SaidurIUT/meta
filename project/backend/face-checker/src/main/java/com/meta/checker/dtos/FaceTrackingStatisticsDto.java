package com.meta.checker.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FaceTrackingStatisticsDto {
    private int totalAttempts;
    private int presentAttempts;
    private double presentPercentage;
}