// AgoraCall.js
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
let previousCameraState = true;
let activeUsers = new Set();

// Initialize the AgoraRTC client
export function initializeClient(appId) {
  if (!rtc.client) {
    rtc.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    setupEventListeners();
    console.log("AgoraRTC client initialized");
  }
  return rtc.client;
}

// Set up event listeners for the client
function setupEventListeners() {
  rtc.client.on("user-published", async (user, mediaType) => {
    try {
      await rtc.client.subscribe(user, mediaType);
      console.log("Subscribed to user:", user.uid, "MediaType:", mediaType);
      activeUsers.add(user.uid);

      if (mediaType === "video") {
        displayRemoteVideo(user);
      }

      if (mediaType === "audio" && user.audioTrack) {
        user.audioTrack.play();
      }
    } catch (error) {
      console.error("Error in user-published event:", error);
    }
  });

  rtc.client.on("user-unpublished", async (user, mediaType) => {
    try {
      await rtc.client.unsubscribe(user, mediaType);
      if (mediaType === "video") {
        removeRemoteVideo(user.uid);
      }
    } catch (error) {
      console.error("Error in user-unpublished event:", error);
    }
  });

  rtc.client.on("user-left", (user) => {
    try {
      removeRemoteVideo(user.uid);
      activeUsers.delete(user.uid);
    } catch (error) {
      console.error("Error in user-left event:", error);
    }
  });

  rtc.client.on("connection-state-change", (curState, prevState) => {
    console.log("Connection state changed from", prevState, "to", curState);
  });
}

// Display remote video with error handling and retry logic
function displayRemoteVideo(user) {
  try {
    const remoteVideoTrack = user.videoTrack;
    if (!remoteVideoTrack) {
      console.warn("No remote video track available for user:", user.uid);
      return;
    }

    const remoteContainer = document.getElementById("remote-videos");
    if (!remoteContainer) {
      console.error("Remote videos container not found");
      return;
    }

    let container = document.getElementById(`remote-${user.uid}`);
    if (!container) {
      container = document.createElement("div");
      container.id = `remote-${user.uid}`;
      container.className = "remote-video-container";
      container.style.width = "200px";
      container.style.height = "150px";
      container.style.position = "relative";
      container.style.overflow = "hidden";
      container.style.borderRadius = "8px";
      container.style.margin = "5px";

      // Add user label
      const label = document.createElement("div");
      label.className = "user-label";
      label.textContent = `User ${user.uid}`;
      label.style.position = "absolute";
      label.style.bottom = "5px";
      label.style.left = "5px";
      label.style.color = "white";
      label.style.background = "rgba(0, 0, 0, 0.5)";
      label.style.padding = "2px 5px";
      label.style.borderRadius = "4px";
      container.appendChild(label);

      remoteContainer.appendChild(container);
    }

    // Stop any existing playback
    try {
      remoteVideoTrack.stop();
    } catch (error) {
      console.warn("Error stopping existing video track:", error);
    }

    // Play new track with retry logic
    const playWithRetry = async (maxAttempts = 3) => {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          remoteVideoTrack.play(container);
          console.log(
            `Successfully played remote video for user ${user.uid} on attempt ${attempt}`
          );
          return;
        } catch (error) {
          console.warn(
            `Attempt ${attempt} failed to play remote video:`,
            error
          );
          if (attempt === maxAttempts) {
            console.error(
              `Failed to play remote video after ${maxAttempts} attempts`
            );
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    };

    playWithRetry().catch((error) => {
      console.error("Final error playing remote video:", error);
      // Handle final failure (e.g., show error message to user)
    });
  } catch (error) {
    console.error("Error in displayRemoteVideo:", error);
  }
}

// Remove remote video
function removeRemoteVideo(uid) {
  try {
    const container = document.getElementById(`remote-${uid}`);
    if (container) {
      container.remove();
    }
  } catch (error) {
    console.error("Error removing remote video:", error);
  }
}

// Clean up video containers
function cleanupVideoContainers() {
  try {
    const localContainer = document.getElementById("local-video");
    if (localContainer) {
      localContainer.innerHTML = "";
      localContainer.style.display = "none";
    }

    const remoteContainer = document.getElementById("remote-videos");
    if (remoteContainer) {
      remoteContainer.innerHTML = "";
      remoteContainer.style.display = "none";
    }

    const screenContainer = document.getElementById("screen-video");
    if (screenContainer) {
      screenContainer.innerHTML = "";
      screenContainer.style.display = "none";
    }
  } catch (error) {
    console.error("Error cleaning up video containers:", error);
  }
}

// Join video call
export async function joinVideo(appId, channel, token = null, uid = null) {
  try {
    if (!rtc.client) {
      initializeClient(appId);
    }

    // Reset containers
    cleanupVideoContainers();

    // Show containers
    const localContainer = document.getElementById("local-video");
    const remoteContainer = document.getElementById("remote-videos");

    if (localContainer) localContainer.style.display = "block";
    if (remoteContainer) remoteContainer.style.display = "block";

    // Join channel
    await rtc.client.join(appId, channel, token, uid);
    console.log("Joined channel:", channel);

    // Create tracks with enhanced settings
    const [audioTrack, videoTrack] = await Promise.all([
      AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: {
          sampleRate: 48000,
          stereo: true,
          bitrate: 128,
        },
      }),
      AgoraRTC.createCameraVideoTrack({
        encoderConfig: {
          width: 640,
          height: 360,
          frameRate: 30,
          bitrateMin: 400,
          bitrateMax: 1000,
        },
        optimizationMode: "detail",
      }),
    ]);

    rtc.localAudioTrack = audioTrack;
    rtc.localVideoTrack = videoTrack;

    // Publish tracks
    await rtc.client.publish([audioTrack, videoTrack]);
    console.log("Published local tracks");

    // Display local video
    if (localContainer && videoTrack) {
      videoTrack.play(localContainer);
    }

    return true;
  } catch (error) {
    console.error("Error joining video:", error);
    await cleanupTracks();
    throw error;
  }
}

// Leave video call
export async function leaveVideo() {
  try {
    if (isScreenSharing) {
      await stopScreenShare();
    }

    await cleanupTracks();

    if (rtc.client) {
      await rtc.client.leave();
      console.log("Left channel");
    }

    // Reset states
    isCameraEnabled = true;
    isMicEnabled = true;
    isScreenSharing = false;
    previousCameraState = true;
    activeUsers.clear();

    cleanupVideoContainers();
  } catch (error) {
    console.error("Error leaving video:", error);
    throw error;
  }
}

// Clean up tracks
async function cleanupTracks() {
  try {
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
    }
  } catch (error) {
    console.error("Error cleaning up tracks:", error);
  }
}

// Toggle camera
export async function toggleCamera() {
  try {
    if (!rtc.localVideoTrack) {
      console.warn("No local video track available");
      return { isOn: isCameraEnabled };
    }

    await rtc.localVideoTrack.setEnabled(!isCameraEnabled);
    isCameraEnabled = !isCameraEnabled;
    console.log("Camera toggled:", isCameraEnabled ? "on" : "off");
    return { isOn: isCameraEnabled };
  } catch (error) {
    console.error("Error toggling camera:", error);
    return { isOn: isCameraEnabled };
  }
}

// Toggle microphone
export async function toggleMic() {
  try {
    if (!rtc.localAudioTrack) {
      console.warn("No local audio track available");
      return { isOn: isMicEnabled };
    }

    await rtc.localAudioTrack.setEnabled(!isMicEnabled);
    isMicEnabled = !isMicEnabled;
    console.log("Microphone toggled:", isMicEnabled ? "on" : "off");
    return { isOn: isMicEnabled };
  } catch (error) {
    console.error("Error toggling microphone:", error);
    return { isOn: isMicEnabled };
  }
}

// Screen sharing functions
async function startScreenShare(appId, channel, token = null, uid = null) {
  try {
    if (isScreenSharing) {
      console.warn("Screen sharing already active");
      return;
    }

    if (!rtc.client) {
      await joinVideo(appId, channel, token, uid);
    }

    previousCameraState = isCameraEnabled;
    rtc.localScreenTrack = await AgoraRTC.createScreenVideoTrack({
      encoderConfig: {
        frameRate: 30,
        bitrateMax: 1500,
        optimizationMode: "detail",
      },
    });

    if (rtc.localVideoTrack) {
      await rtc.client.unpublish(rtc.localVideoTrack);
    }

    await rtc.client.publish(rtc.localScreenTrack);
    isScreenSharing = true;

    const screenContainer = document.getElementById("screen-video");
    if (screenContainer) {
      rtc.localScreenTrack.play(screenContainer);
      screenContainer.style.display = "block";
    }

    rtc.localScreenTrack.on("track-ended", () => {
      stopScreenShare();
    });
  } catch (error) {
    console.error("Error starting screen share:", error);
    if (rtc.localVideoTrack) {
      await rtc.client.publish(rtc.localVideoTrack);
    }
    throw error;
  }
}

// Stop screen sharing
async function stopScreenShare() {
  try {
    if (!isScreenSharing) {
      console.warn("Screen sharing not active");
      return;
    }

    if (rtc.localScreenTrack) {
      await rtc.client.unpublish(rtc.localScreenTrack);
      rtc.localScreenTrack.close();
      rtc.localScreenTrack = null;
    }

    if (rtc.localVideoTrack && previousCameraState) {
      await rtc.client.publish(rtc.localVideoTrack);
      isCameraEnabled = previousCameraState;
    }

    isScreenSharing = false;

    const screenContainer = document.getElementById("screen-video");
    if (screenContainer) {
      screenContainer.innerHTML = "";
      screenContainer.style.display = "none";
    }
  } catch (error) {
    console.error("Error stopping screen share:", error);
    throw error;
  }
}

// Toggle screen sharing
export async function toggleScreenShare(
  appId,
  channel,
  token = null,
  uid = null
) {
  try {
    if (isScreenSharing) {
      await stopScreenShare();
      return { isScreenSharing: false };
    } else {
      await startScreenShare(appId, channel, token, uid);
      return { isScreenSharing: true };
    }
  } catch (error) {
    console.error("Error toggling screen share:", error);
    return { isScreenSharing };
  }
}

// Status getters
export function getCameraStatus() {
  return isCameraEnabled;
}

export function getMicStatus() {
  return isMicEnabled;
}

export function getScreenShareStatus() {
  return isScreenSharing;
}

export function getActiveUsers() {
  return Array.from(activeUsers);
}

// Get client instance
export function getClient() {
  return rtc.client;
}

// CSS for video containers
export const videoContainerStyles = `
.remote-video-container {
  position: relative;
  width: 200px;
  height: 150px;
  margin: 5px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #1a1a1a;
}

.user-label {
  position: absolute;
  bottom: 5px;
  left: 5px;
  color: white;
  background: rgba(0, 0, 0, 0.5);
  padding: 2px 5px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 1;
}

#local-video {
  width: 200px;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #1a1a1a;
  margin: 5px;
}

#remote-videos {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
}

#screen-video {
  width: 100%;
  max-width: 800px;
  height: auto;
  border-radius: 8px;
  overflow: hidden;
  margin: 10px auto;
  background-color: #1a1a1a;
  display: none;
}
`;
