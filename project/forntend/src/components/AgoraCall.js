// src/services/AgoraCall.js

import AgoraRTC from "agora-rtc-sdk-ng";

let rtc = {
  localAudioTrack: null,
  localVideoTrack: null,
  localScreenTrack: null, // New screen track
  client: null,
};

let isCameraEnabled = true;
let isMicEnabled = true;
let isScreenSharing = false; // Track screen sharing status

// Initialize the AgoraRTC client
export function initializeClient(appId) {
  if (!rtc.client) {
    rtc.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    setupEventListeners();
    console.log("AgoraRTC client initialized");
  }
}

// Handle remote user events
function setupEventListeners() {
  rtc.client.on("user-published", async (user, mediaType) => {
    await rtc.client.subscribe(user, mediaType);
    console.log("Subscribe success");

    if (mediaType === "video") {
      displayRemoteVideo(user);
    }

    if (mediaType === "audio") {
      user.audioTrack.play();
    }
  });

  rtc.client.on("user-unpublished", (user) => {
    const remotePlayerContainer = document.getElementById(`remote-${user.uid}`);
    remotePlayerContainer && remotePlayerContainer.remove();
  });

  rtc.client.on("user-left", (user) => {
    const remotePlayerContainer = document.getElementById(`remote-${user.uid}`);
    remotePlayerContainer && remotePlayerContainer.remove();
  });
}

// Display remote video
function displayRemoteVideo(user) {
  const remoteVideoTrack = user.videoTrack;
  const remotePlayerContainer = document.createElement("div");
  remotePlayerContainer.id = `remote-${user.uid}`;
  remotePlayerContainer.style.width = "200px";
  remotePlayerContainer.style.height = "150px";
  remotePlayerContainer.style.position = "absolute";
  remotePlayerContainer.style.bottom = "10px";
  remotePlayerContainer.style.right = "10px";
  remotePlayerContainer.style.background = "black";
  remotePlayerContainer.style.border = "2px solid white";
  remotePlayerContainer.style.zIndex = 1000;
  document.body.appendChild(remotePlayerContainer);

  remoteVideoTrack.play(remotePlayerContainer);
}

// Join a channel and publish local media
export async function joinVideo(appId, channel, token = null, uid = null) {
  if (!rtc.client) {
    initializeClient(appId);
  }

  try {
    await rtc.client.join(appId, channel, token, uid);
    console.log(`Joined channel: ${channel}`);

    // Create and publish local tracks
    rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();

    await rtc.client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);
    console.log("Published local audio and video tracks");

    // Display local video
    const localPlayerContainer = document.getElementById("local-video");
    if (localPlayerContainer) {
      rtc.localVideoTrack.play(localPlayerContainer);
      localPlayerContainer.style.display = "block";
    }
  } catch (error) {
    console.error("Failed to join video call:", error);
  }
}

// Leave the channel and clean up
export async function leaveVideo() {
  try {
    if (rtc.client) {
      await rtc.client.leave();
      rtc.client = null;
    }

    if (rtc.localAudioTrack) {
      rtc.localAudioTrack.close();
      rtc.localAudioTrack = null;
    }

    if (rtc.localVideoTrack) {
      rtc.localVideoTrack.close();
      rtc.localVideoTrack = null;
    }

    if (rtc.localScreenTrack) {
      rtc.localScreenTrack.close();
      rtc.localScreenTrack = null;
      isScreenSharing = false;
    }

    // Remove local video
    const localPlayerContainer = document.getElementById("local-video");
    if (localPlayerContainer) {
      localPlayerContainer.innerHTML = "";
      localPlayerContainer.style.display = "none";
    }

    // Remove remote videos
    const remoteVideos = document.querySelectorAll("[id^='remote-']");
    remoteVideos.forEach((video) => video.remove());

    console.log("Left the video call");
  } catch (error) {
    console.error("Failed to leave video call:", error);
  }
}

// Toggle Camera
export async function toggleCamera() {
  if (!rtc.localVideoTrack) {
    console.warn("No local video track available.");
    return { isOn: isCameraEnabled };
  }

  try {
    if (isCameraEnabled) {
      await rtc.localVideoTrack.setEnabled(false);
      isCameraEnabled = false;
    } else {
      await rtc.localVideoTrack.setEnabled(true);
      isCameraEnabled = true;
    }
    console.log(`Camera is now ${isCameraEnabled ? "on" : "off"}`);
    return { isOn: isCameraEnabled };
  } catch (error) {
    console.error("Error toggling camera:", error);
    return { isOn: isCameraEnabled };
  }
}

// Toggle Microphone
export async function toggleMic() {
  if (!rtc.localAudioTrack) {
    console.warn("No local audio track available.");
    return { isOn: isMicEnabled };
  }

  try {
    if (isMicEnabled) {
      await rtc.localAudioTrack.setEnabled(false);
      isMicEnabled = false;
    } else {
      await rtc.localAudioTrack.setEnabled(true);
      isMicEnabled = true;
    }
    console.log(`Microphone is now ${isMicEnabled ? "on" : "off"}`);
    return { isOn: isMicEnabled };
  } catch (error) {
    console.error("Error toggling microphone:", error);
    return { isOn: isMicEnabled };
  }
}

// Start Screen Sharing
export async function startScreenShare(appId, channel, token = null, uid = null) {
  if (isScreenSharing) {
    console.warn("Screen sharing is already active.");
    return;
  }

  try {
    // Ensure the client is initialized and joined
    if (!rtc.client) {
      await joinVideo(appId, channel, token, uid);
    }

    // Create screen video track
    rtc.localScreenTrack = await AgoraRTC.createScreenVideoTrack();

    // Publish screen track
    await rtc.client.publish(rtc.localScreenTrack);
    console.log("Published screen video track");

    isScreenSharing = true;

    // Optionally, display the screen share video locally
    const screenPlayerContainer = document.getElementById("screen-video");
    if (screenPlayerContainer) {
      rtc.localScreenTrack.play(screenPlayerContainer);
      screenPlayerContainer.style.display = "block";
    }
  } catch (error) {
    console.error("Failed to start screen sharing:", error);
  }
}

// Stop Screen Sharing
export async function stopScreenShare() {
  if (!isScreenSharing) {
    console.warn("Screen sharing is not active.");
    return;
  }

  try {
    if (rtc.localScreenTrack) {
      await rtc.client.unpublish(rtc.localScreenTrack);
      rtc.localScreenTrack.close();
      rtc.localScreenTrack = null;
      console.log("Unpublished and closed screen video track");
    }

    isScreenSharing = false;

    // Hide the screen share video locally
    const screenPlayerContainer = document.getElementById("screen-video");
    if (screenPlayerContainer) {
      screenPlayerContainer.innerHTML = "";
      screenPlayerContainer.style.display = "none";
    }
  } catch (error) {
    console.error("Failed to stop screen sharing:", error);
  }
}

// Toggle Screen Sharing
export async function toggleScreenShare(appId, channel, token = null, uid = null) {
  if (isScreenSharing) {
    await stopScreenShare();
    return { isScreenSharing: false };
  } else {
    await startScreenShare(appId, channel, token, uid);
    return { isScreenSharing: true };
  }
}

// Get current status
export function getCameraStatus() {
  return isCameraEnabled;
}

export function getMicStatus() {
  return isMicEnabled;
}

export function getScreenShareStatus() {
  return isScreenSharing;
}
