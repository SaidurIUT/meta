// AgoraCall.js
import AgoraRTC from "agora-rtc-sdk-ng";

// Primary client for camera + mic
// Second (screen) client for screen share
let rtc = {
  client: null,
  localAudioTrack: null,
  localVideoTrack: null,

  screenClient: null,
  localScreenTrack: null,
};

let isCameraEnabled = true;
let isMicEnabled = true;
let isScreenSharing = false;

// Keep track of remote users
let activeUsers = new Set();

// We’ll store these after successful .join() calls
// so we know which UIDs are ours (camera vs. screen).
let mainClientUid = null;
let screenClientUid = null;

/**
 * Utility to check if a given user.uid is actually "me"
 * (my main client or my screen client).
 */
function isLocalUid(uid) {
  // Sometimes the uid can be a number or a string; do a == check or unify them.
  const uidStr = String(uid);
  return (
    uidStr === String(mainClientUid) ||
    (screenClientUid && uidStr === String(screenClientUid))
  );
}

// ---------- Initialize the Main Client (camera + mic) ----------
export function initializeClient(appId) {
  if (!rtc.client) {
    rtc.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    setupMainClientListeners(rtc.client);
    console.log("AgoraRTC main client initialized");
  }
  return rtc.client;
}

function setupMainClientListeners(client) {
  client.on("user-published", async (user, mediaType) => {
    try {
      // Skip if user is actually me (avoid duplicates)
      if (isLocalUid(user.uid)) {
        return;
      }
      await client.subscribe(user, mediaType);
      console.log("[MainClient] Subscribed to user:", user.uid, "media:", mediaType);

      activeUsers.add(user.uid);

      if (mediaType === "video" && user.videoTrack) {
        displayRemoteVideo(user);
      }
      if (mediaType === "audio" && user.audioTrack) {
        user.audioTrack.play();
      }
    } catch (error) {
      console.error("[MainClient] Error in user-published:", error);
    }
  });

  client.on("user-unpublished", async (user, mediaType) => {
    try {
      if (!isLocalUid(user.uid)) {
        await client.unsubscribe(user, mediaType);
      }
      if (mediaType === "video") {
        removeRemoteVideo(user.uid);
      }
    } catch (error) {
      console.error("[MainClient] Error in user-unpublished:", error);
    }
  });

  client.on("user-left", (user) => {
    if (!isLocalUid(user.uid)) {
      removeRemoteVideo(user.uid);
      activeUsers.delete(user.uid);
    }
  });

  client.on("connection-state-change", (curState, prevState) => {
    console.log("[MainClient] Connection state changed from", prevState, "to", curState);
  });
}

// ---------- Initialize the Screen‐Share Client ----------
function initializeScreenClient(appId) {
  if (!rtc.screenClient) {
    rtc.screenClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    setupScreenClientListeners(rtc.screenClient);
    console.log("AgoraRTC screen client initialized");
  }
  return rtc.screenClient;
}

function setupScreenClientListeners(client) {
  // We do NOT really need to subscribe to remote tracks on the screen client,
  // because it's just for publishing screen share. But let's keep a minimal approach:
  client.on("user-published", async (user, mediaType) => {
    try {
      // Skip if it's me, or if we don't care about remote from screen client
      if (isLocalUid(user.uid)) {
        return;
      }
      await client.subscribe(user, mediaType);
      console.log("[ScreenClient] Subscribed to user:", user.uid, "media:", mediaType);

      activeUsers.add(user.uid);

      if (mediaType === "video" && user.videoTrack) {
        displayRemoteVideo(user);
      }
      if (mediaType === "audio" && user.audioTrack) {
        user.audioTrack.play();
      }
    } catch (error) {
      console.error("[ScreenClient] Error in user-published:", error);
    }
  });

  client.on("user-unpublished", async (user, mediaType) => {
    try {
      if (!isLocalUid(user.uid)) {
        await client.unsubscribe(user, mediaType);
      }
      if (mediaType === "video") {
        removeRemoteVideo(user.uid);
      }
    } catch (error) {
      console.error("[ScreenClient] Error in user-unpublished:", error);
    }
  });

  client.on("user-left", (user) => {
    if (!isLocalUid(user.uid)) {
      removeRemoteVideo(user.uid);
      activeUsers.delete(user.uid);
    }
  });

  client.on("connection-state-change", (curState, prevState) => {
    console.log("[ScreenClient] Connection state changed from", prevState, "to", curState);
  });
}

// ---------- Display / Remove remote video ----------
function displayRemoteVideo(user) {
  try {
    const remoteVideoTrack = user.videoTrack;
    if (!remoteVideoTrack) {
      console.warn("No remote video track for user:", user.uid);
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

      // Label
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

    // Stop existing playback if any
    try {
      remoteVideoTrack.stop();
    } catch (err) {
      console.warn("Error stopping previous track:", err);
    }

    remoteVideoTrack.play(container);
  } catch (error) {
    console.error("Error in displayRemoteVideo:", error);
  }
}

function removeRemoteVideo(uid) {
  const container = document.getElementById(`remote-${uid}`);
  if (container) {
    container.remove();
  }
}

// ---------- Cleanup DOM containers ----------
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
  } catch (err) {
    console.error("Error cleaning up video containers:", err);
  }
}

// ---------- Join with camera + mic ----------
export async function joinVideo(appId, channel, token = null, uid = null) {
  try {
    if (!rtc.client) {
      initializeClient(appId);
    }

    cleanupVideoContainers();

    const localContainer = document.getElementById("local-video");
    const remoteContainer = document.getElementById("remote-videos");
    if (localContainer) localContainer.style.display = "block";
    if (remoteContainer) remoteContainer.style.display = "block";

    // Join main client channel
    const assignedUid = await rtc.client.join(appId, channel, token, uid);
    mainClientUid = assignedUid; 
    console.log(`Main client joined channel: ${channel} with UID: ${mainClientUid}`);

    // Create camera + mic
    rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
      encoderConfig: { sampleRate: 48000, stereo: true, bitrate: 128 },
    });
    rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack({
      encoderConfig: {
        width: 640,
        height: 360,
        frameRate: 30,
        bitrateMin: 400,
        bitrateMax: 1000,
      },
      optimizationMode: "detail",
    });

    // Publish
    await rtc.client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);
    console.log("Published local camera+mic tracks");

    // Show local video
    if (localContainer && rtc.localVideoTrack) {
      rtc.localVideoTrack.play(localContainer);
    }
    return true;
  } catch (error) {
    console.error("Error joining video:", error);
    await cleanupTracks();
    throw error;
  }
}

// ---------- Join with audio only (no camera) ----------
export async function joinChannelNoCamera(appId, channel, token = null, uid = null) {
  try {
    if (!rtc.client) {
      initializeClient(appId);
    }

    cleanupVideoContainers();
    const remoteContainer = document.getElementById("remote-videos");
    if (remoteContainer) remoteContainer.style.display = "block";

    const assignedUid = await rtc.client.join(appId, channel, token, uid);
    mainClientUid = assignedUid;
    console.log(`Main client joined (no camera) channel: ${channel} UID: ${mainClientUid}`);

    // Audio track only
    rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
      encoderConfig: { sampleRate: 48000, stereo: true, bitrate: 128 },
    });

    await rtc.client.publish(rtc.localAudioTrack);
    console.log("Published local audio track (no camera)");

    return true;
  } catch (error) {
    console.error("Error joining no-camera channel:", error);
    await cleanupTracks();
    throw error;
  }
}

// ---------- Leave (stop everything) ----------
export async function leaveVideo() {
  try {
    if (isScreenSharing) {
      await stopScreenShare();
    }
    await cleanupTracks();

    if (rtc.client) {
      await rtc.client.leave();
      console.log("Left main client channel");
    }

    mainClientUid = null;
    screenClientUid = null;
    isCameraEnabled = true;
    isMicEnabled = true;
    isScreenSharing = false;
    activeUsers.clear();

    cleanupVideoContainers();
  } catch (error) {
    console.error("Error leaving video:", error);
    throw error;
  }
}

// ---------- Cleanup local tracks ----------
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
  } catch (err) {
    console.error("Error cleaning up tracks:", err);
  }
}

// ---------- Toggle camera on/off ----------
export async function toggleCamera() {
  try {
    if (!rtc.localVideoTrack) {
      console.warn("No local video track available");
      return { isOn: isCameraEnabled };
    }
    await rtc.localVideoTrack.setEnabled(!isCameraEnabled);
    isCameraEnabled = !isCameraEnabled;
    console.log("Camera toggled =>", isCameraEnabled ? "ON" : "OFF");
    return { isOn: isCameraEnabled };
  } catch (err) {
    console.error("Error toggling camera:", err);
    return { isOn: isCameraEnabled };
  }
}

// ---------- Toggle mic on/off ----------
export async function toggleMic() {
  try {
    if (!rtc.localAudioTrack) {
      console.warn("No local audio track available");
      return { isOn: isMicEnabled };
    }
    await rtc.localAudioTrack.setEnabled(!isMicEnabled);
    isMicEnabled = !isMicEnabled;
    console.log("Mic toggled =>", isMicEnabled ? "ON" : "OFF");
    return { isOn: isMicEnabled };
  } catch (err) {
    console.error("Error toggling mic:", err);
    return { isOn: isMicEnabled };
  }
}

// ---------- SCREEN SHARE (2nd CLIENT) ----------
async function startScreenShare(appId, channel, token = null, uid = null) {
  try {
    if (isScreenSharing) {
      console.warn("Screen sharing already active.");
      return;
    }
    if (!rtc.screenClient) {
      initializeScreenClient(appId);
    }

    // We can pick a different UID for screen
    const assignedUid = await rtc.screenClient.join(appId, channel, token, uid ? uid + "-screen" : null);
    screenClientUid = assignedUid;
    console.log("ScreenClient joined channel, UID:", screenClientUid);

    // Create screen track
    rtc.localScreenTrack = await AgoraRTC.createScreenVideoTrack({
      encoderConfig: {
        frameRate: 15,
        bitrateMax: 1200,
        optimizationMode: "detail",
      },
    });

    await rtc.screenClient.publish(rtc.localScreenTrack);
    console.log("Published screen track from screenClient");

    isScreenSharing = true;

    // Show local screen preview
    const screenContainer = document.getElementById("screen-video");
    if (screenContainer) {
      screenContainer.innerHTML = "";
      rtc.localScreenTrack.play(screenContainer);
      screenContainer.style.display = "block";
    }

    // If user stops from OS tray, we end share
    rtc.localScreenTrack.on("track-ended", () => {
      stopScreenShare();
    });
  } catch (error) {
    console.error("Error starting screen share:", error);
    throw error;
  }
}

async function stopScreenShare() {
  try {
    if (!isScreenSharing) {
      console.warn("No screen sharing is active.");
      return;
    }
    // Unpublish & close local screen track
    if (rtc.localScreenTrack) {
      await rtc.screenClient.unpublish(rtc.localScreenTrack);
      rtc.localScreenTrack.close();
      rtc.localScreenTrack = null;
    }
    // Leave the screenClient channel
    if (rtc.screenClient) {
      await rtc.screenClient.leave();
      rtc.screenClient = null;
    }
    screenClientUid = null;
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

// ---------- Toggle screen share ----------
export async function toggleScreenShare(appId, channel, token = null, uid = null) {
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

// ---------- Helpers / Status ----------
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
export function getClient() {
  return rtc.client;
}
