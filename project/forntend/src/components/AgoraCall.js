import AgoraRTC from "agora-rtc-sdk-ng";

let rtc = {
  localAudioTrack: null,
  localVideoTrack: null,
  client: null,
};

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
  const remotePlayerContainer = document.getElementById(`remote-${user.uid}`);

  if (remotePlayerContainer) {
    // Already exists
    return;
  }

  const container = document.createElement("div");
  container.id = `remote-${user.uid}`;
  container.style.width = "200px";
  container.style.height = "150px";
  container.style.position = "absolute";
  container.style.bottom = "10px";
  container.style.right = "10px";
  container.style.background = "black";
  container.style.border = "2px solid white";
  container.style.zIndex = 1000;
  document.body.appendChild(container);

  remoteVideoTrack.play(container);
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
    console.log("Published local tracks");

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