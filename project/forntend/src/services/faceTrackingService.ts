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

export interface DateRangeRequest {
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

export interface TrackingReportResponse {
  data: FaceTrackingData[];
  totalRecords: number;
}

export const faceTrackingService = {
  // Track face data with image upload
  trackFace: async (data: TrackFaceRequest): Promise<FaceTrackingData> => {
    try {
      const formData = new FormData();
      formData.append("officeId", data.officeId);
      formData.append("image", data.image);

      const response = await privateAxios.post<FaceTrackingData>(
        "/ac/face/track",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to track face data: " + error);
    }
  },

  // Get tracking reports for an office within a date range
  getTrackingReports: async (
    officeId: string,
    dateRange: DateRangeRequest
  ): Promise<FaceTrackingData[]> => {
    try {
      const response = await privateAxios.get<FaceTrackingData[]>(
        `/ac/face/reports/${officeId}`,
        {
          params: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch tracking reports: " + error);
    }
  },

  // Get specific tracking record by ID
  getTrackingById: async (trackingId: string): Promise<FaceTrackingData> => {
    try {
      const response = await privateAxios.get<FaceTrackingData>(
        `/ac/face/${trackingId}`
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch tracking record: " + error);
    }
  },

  // Get user tracking history for a specific office and date range
  getUserTrackingHistory: async (
    userId: string,
    officeId: string,
    dateRange: DateRangeRequest
  ): Promise<FaceTrackingData[]> => {
    try {
      const response = await privateAxios.get<FaceTrackingData[]>(
        `/ac/face/user/${userId}/office/${officeId}`,
        {
          params: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch user tracking history: " + error);
    }
  },

  // Get today's tracking records for an office
  getTodayTrackings: async (officeId: string): Promise<FaceTrackingData[]> => {
    try {
      const response = await privateAxios.get<FaceTrackingData[]>(
        `/ac/face/today/${officeId}`
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch today's tracking records: " + error);
    }
  },

  // Helper method to format date for API requests
  formatDate: (date: Date): string => {
    return date.toISOString();
  },

  // Example usage of date formatting
  getDateRange: (startDate: Date, endDate: Date): DateRangeRequest => {
    return {
      startDate: faceTrackingService.formatDate(startDate),
      endDate: faceTrackingService.formatDate(endDate),
    };
  },
};

// Example usage:
/*
// Track face
const trackFaceData = {
  officeId: "office123",
  image: imageFile // File object from input
};
const result = await faceTrackingService.trackFace(trackFaceData);

// Get tracking reports
const dateRange = faceTrackingService.getDateRange(
  new Date("2024-01-01"),
  new Date("2024-01-31")
);
const reports = await faceTrackingService.getTrackingReports("office123", dateRange);

// Get today's trackings
const todayTrackings = await faceTrackingService.getTodayTrackings("office123");

// Get user history
const userHistory = await faceTrackingService.getUserTrackingHistory(
  "user123",
  "office123",
  dateRange
);
*/
