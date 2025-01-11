package com.meta.checker.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class FaceTrackingDto {

    private Long id;

    private String officeId;

    private String userId;

    private Boolean isPresent;

    private String imageUrl;

    private String clickedAt;
}
