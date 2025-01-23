// src/app/office/[id]/layout.tsx
"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { faceTrackingService } from "@/services/tracking/faceTrackingService";
import { toast } from "@/hooks/use-toast";

const capturePhoto = async (): Promise<File | null> => {
  try {
    // Access the webcam and capture a photo
    const video = document.createElement("video");
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play();

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Stop the video stream
    stream.getTracks().forEach((track) => track.stop());

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((blob) => resolve(blob), "image/jpeg")
    );

    return blob ? new File([blob], "photo.jpg", { type: "image/jpeg" }) : null;
  } catch (error) {
    console.error("Error capturing photo:", error);
    return null;
  }
};

export default function OfficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const officeId = params.id as string;

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (officeId) {
      const captureAndSendPhoto = async () => {
        try {
          const image = await capturePhoto();
          if (image) {
            await faceTrackingService.trackFace({ officeId, image });
            console.log("Photo sent successfully.");
            toast({
              description: "Photo sent successfully.",
              type: "foreground",
            });
          }
        } catch (error) {
          console.error("Error sending photo:", error);
        }
      };

      // Start capturing photos every 10 minutes
      captureAndSendPhoto(); // Initial capture
      intervalId = setInterval(captureAndSendPhoto, 30 * 60 * 1000);

      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }
  }, [officeId]);

  return <>{children}</>;
}
