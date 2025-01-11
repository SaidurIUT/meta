package com.meta.checker.srevice;

import com.meta.checker.dtos.FaceTrackingDto;
import org.springframework.web.multipart.MultipartFile;

public interface FaceTrackingService {
    FaceTrackingDto trackFace(String officeId, MultipartFile image);
}
