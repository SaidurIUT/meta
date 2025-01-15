// src/services/AgoraCall.js

import AgoraRTC from "agora-rtc-sdk-ng";

let rtc = {
  localAudioTrack: null,
  localVideoTrack: null,
  localScreenTrack: null,
  client: null,
};

let isCameraEnabled = true;
let isMicEnabled = true;
let isScreenSharing = false;
let previousCameraState = true; // Store camera state before screen sharing

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
    console.log("Subscribed to user:", user.uid, "MediaType:", mediaType);

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
    console.log("User unpublished:", user.uid);
  });

  rtc.client.on("user-left", (user) => {
    const remotePlayerContainer = document.getElementById(`remote-${user.uid}`);
    remotePlayerContainer && remotePlayerContainer.remove();
    console.log("User left:", user.uid);
  });
}

// Display Remote Video
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
  console.log("Displaying remote video for user:", user.uid);
}

// Join the channel
export async function joinVideo(appId, channel, token = null, uid = null) {
  if (!rtc.client) {
    initializeClient(appId);
  }

  try {
    await rtc.client.join(appId, channel, token, uid);
    console.log(`Joined channel: ${channel}`);

    rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();

    await rtc.client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);
    console.log("Published local audio and video tracks");

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
    // Stop screen sharing if active
    if (isScreenSharing) {
      await stopScreenShare();
    }

    if (rtc.client) {
      await rtc.client.leave();
      rtc.client = null;
      console.log("Left the channel");
    }

    if (rtc.localAudioTrack) {
      rtc.localAudioTrack.close();
      rtc.localAudioTrack = null;
      console.log("Closed local audio track");
    }

    if (rtc.localVideoTrack) {
      rtc.localVideoTrack.close();
      rtc.localVideoTrack = null;
      console.log("Closed local video track");
    }

    // Reset all states
    isCameraEnabled = true;
    isMicEnabled = true;
    isScreenSharing = false;
    previousCameraState = true;

    const localPlayerContainer = document.getElementById("local-video");
    if (localPlayerContainer) {
      localPlayerContainer.innerHTML = "";
      localPlayerContainer.style.display = "none";
      console.log("Hidden local video container");
    }

    const screenPlayerContainer = document.getElementById("screen-video");
    if (screenPlayerContainer) {
      screenPlayerContainer.innerHTML = "";
      screenPlayerContainer.style.display = "none";
      console.log("Hidden screen share container");
    }

    const remoteVideos = document.querySelectorAll("[id^='remote-']");
    remoteVideos.forEach((video) => video.remove());
    console.log("Removed all remote video containers");
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
    await rtc.localVideoTrack.setEnabled(!isCameraEnabled);
    isCameraEnabled = !isCameraEnabled;
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
    await rtc.localAudioTrack.setEnabled(!isMicEnabled);
    isMicEnabled = !isMicEnabled;
    console.log(`Microphone is now ${isMicEnabled ? "on" : "off"}`);
    return { isOn: isMicEnabled };
  } catch (error) {
    console.error("Error toggling microphone:", error);
    return { isOn: isMicEnabled };
  }
}

// Start Screen Sharing
async function startScreenShare(appId, channel, token = null, uid = null) {
  if (isScreenSharing) {
    console.warn("Screen sharing is already active.");
    return;
  }

  try {
    if (!rtc.client) {
      await joinVideo(appId, channel, token, uid);
    }

    // Store current camera state before starting screen share
    previousCameraState = isCameraEnabled;

    // Create screen video track
    rtc.localScreenTrack = await AgoraRTC.createScreenVideoTrack();

    // Unpublish camera track if it exists
    if (rtc.localVideoTrack) {
      await rtc.client.unpublish(rtc.localVideoTrack);
      console.log("Unpublished camera video track");
    }

    // Publish screen track
    await rtc.client.publish(rtc.localScreenTrack);
    console.log("Published screen video track");

    isScreenSharing = true;

    const screenPlayerContainer = document.getElementById("screen-video");
    if (screenPlayerContainer) {
      rtc.localScreenTrack.play(screenPlayerContainer);
      screenPlayerContainer.style.display = "block";
      console.log("Displayed screen share container");
    }
  } catch (error) {
    console.error("Failed to start screen sharing:", error);
    // Restore camera track if screen sharing fails
    if (rtc.localVideoTrack) {
      await rtc.client.publish(rtc.localVideoTrack);
      console.log("Re-published camera video track after failure");
    }
  }
}

// Stop Screen Sharing
async function stopScreenShare() {
  if (!isScreenSharing) {
    console.warn("Screen sharing is not active.");
    return;
  }

  try {
    if (rtc.localScreenTrack) {
      await rtc.client.unpublish(rtc.localScreenTrack);
      rtc.localScreenTrack.close();
      rtc.localScreenTrack = null;
      console.log("Stopped and closed screen video track");
    }

    // Republish camera track if it was previously enabled
    if (rtc.localVideoTrack && previousCameraState) {
      await rtc.client.publish(rtc.localVideoTrack);
      isCameraEnabled = previousCameraState;
      console.log("Re-published camera video track");
    }

    isScreenSharing = false;

    const screenPlayerContainer = document.getElementById("screen-video");
    if (screenPlayerContainer) {
      screenPlayerContainer.innerHTML = "";
      screenPlayerContainer.style.display = "none";
      console.log("Hidden screen share container");
    }
  } catch (error) {
    console.error("Failed to stop screen sharing:", error);
  }
}

// Toggle Screen Share
export async function toggleScreenShare(appId, channel, token = null, uid = null) {
  if (isScreenSharing) {
    await stopScreenShare();
    return { isScreenSharing: false };
  } else {
    await startScreenShare(appId, channel, token, uid);
    return { isScreenSharing: true };
  }
}

// Getters for status
export function getCameraStatus() {
  return isCameraEnabled;
}

export function getMicStatus() {
  return isMicEnabled;
}

export function getScreenShareStatus() {
  return isScreenSharing;
}
