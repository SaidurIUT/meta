// src/services/faceTrackingService.ts
import { privateAxios } from "./axiosConfig";

// Define TypeScript interfaces for Face Tracking
export interface FaceTrackingData {
  id: string;
  officeId: string;
  userId: string;
  isPresent: boolean;
  imageUrl: string;
  clickedAt: string;
}

export interface TrackFaceRequest {
  officeId: string;
  image: File;
}

export const faceTrackingService = {
  // Track face data
  trackFace: async (data: TrackFaceRequest): Promise<FaceTrackingData> => {
    const formData = new FormData();
    formData.append("officeId", data.officeId);
    formData.append("image", data.image);

    const response = await privateAxios.post("/ac/face/track", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
