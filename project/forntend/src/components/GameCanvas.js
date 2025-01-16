// src/components/GameCanvas.jsx

import React, { useEffect, useRef, useState } from "react";
import kaboom from "kaboom";
import WebSocketService from "../services/WebSocketService";
import Chatbox from "./Chatbox";
import DiscordDialog from "./DiscordDialog"; // Import the DiscordDialog
import {
  joinVideo,
  leaveVideo,
  toggleCamera,
  toggleMic,
  toggleScreenShare,
} from "./AgoraCall";
import {
  FaComments,
  FaVideo,
  FaVideoSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaDesktop,
  FaStop,
  FaDiscord, // Import Discord icon
} from "react-icons/fa";
import styles from "./GameCanvas.module.css";

const AGORA_APP_ID = "aa57b40426c74add85bb5dcae4557ef6";

function GameCanvas({ playerName, roomId }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const otherPlayers = useRef({});
  const playerRef = useRef(null);
  const activeCallRef = useRef(false);
  const nearChairRef = useRef(null);
  const isPlayerSittingRef = useRef(false);
  const CHAIR_PROXIMITY = 40;

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const PROXIMITY_THRESHOLD = 100;
  const PLAYER_SPEED = 3600;

  const UPDATE_INTERVAL = 1000 / 30;
  const INTERPOLATION_DELAY = 100;
  const CLEANUP_DELAY = 1000;

  const prevMovingRef = useRef(false);
  const prevDirectionRef = useRef("down");

  const cleanupTimeoutRef = useRef(null);
  const lastUpdateRef = useRef(0);

  const [remoteStreams, setRemoteStreams] = useState([]);

  // State to manage Discord dialog
  const [isDiscordOpen, setIsDiscordOpen] = useState(false);
  const [selectedDiscordChannel, setSelectedDiscordChannel] = useState(null);

  const openDiscord = () => {
    setIsDiscordOpen(true);
  };

  const closeDiscord = () => {
    setIsDiscordOpen(false);
  };

  useEffect(() => {
    let isMounted = true;

    const k = kaboom({
      global: false,
      width: 800,
      height: 500,
      scale: 2,
      camScale: 2,
      debug: false,
      background: [0, 0, 0, 1],
      canvas: canvasRef.current,
      stretch: true,
      letterbox: false,
    });

    if (isMounted) {
      gameRef.current = k;
      console.log("Kaboom instance created:", gameRef.current);
    }

    // Load sprites
    k.loadSprite("player", "/ash.png", {
      sliceX: 52,
      sliceY: 1,
      anims: {
        "idle-right": { from: 0, to: 5, speed: 10, loop: true },
        "idle-up": { from: 6, to: 11, speed: 10, loop: true },
        "idle-left": { from: 12, to: 17, speed: 10, loop: true },
        "idle-down": { from: 18, to: 23, speed: 10, loop: true },
        "run-right": { from: 24, to: 29, speed: 15, loop: true },
        "run-up": { from: 30, to: 35, speed: 15, loop: true },
        "run-left": { from: 36, to: 41, speed: 15, loop: true },
        "run-down": { from: 42, to: 47, speed: 15, loop: true },
        "sit-down": { from: 48, to: 48, speed: 1, loop: false },
        "sit-up": { from: 49, to: 49, speed: 1, loop: false },
        "sit-left": { from: 50, to: 50, speed: 1, loop: false },
        "sit-right": { from: 51, to: 51, speed: 1, loop: false },
      },
    });
    k.loadSprite("map", "/mapfinal1.png");

    // Proximity check for video calls
    k.onUpdate(() => {
      if (!playerRef.current) return;

      let inProximity = false;
      Object.values(otherPlayers.current).forEach((otherPlayer) => {
        const distance = playerRef.current.pos.dist(otherPlayer.sprite.pos);
        if (distance < PROXIMITY_THRESHOLD) {
          inProximity = true;
        }
      });

      if (inProximity && !activeCallRef.current) {
        try {
          console.log("Proximity detected. Joining video call...");
          joinVideo(AGORA_APP_ID, roomId);
          activeCallRef.current = true;
          console.log("Video call started!");
          const localVideo = document.getElementById("local-video");
          if (localVideo) localVideo.style.display = "block";
        } catch (error) {
          console.error("Error starting video call:", error);
        }
      } else if (!inProximity && activeCallRef.current) {
        try {
          console.log("Proximity lost. Leaving video call...");
          leaveVideo();
          activeCallRef.current = false;
          console.log("Video call ended!");
          const localVideo = document.getElementById("local-video");
          if (localVideo) localVideo.style.display = "none";
        } catch (error) {
          console.error("Error ending video call:", error);
        }
      }
    });

    const startGame = async () => {
      try {
        const mapResponse = await fetch("/mapfinal1.json");
        if (!mapResponse.ok) {
          throw new Error(`Failed to load map.json: ${mapResponse.statusText}`);
        }
        const mapData = await mapResponse.json();

        const map = k.add([k.pos(0, 0), k.anchor("topleft")]);
        const mapSprite = map.add([k.sprite("map"), k.anchor("topleft")]);

        const boundariesLayer = mapData.layers.find(
          (layer) => layer.name === "boundaries"
        );
        if (boundariesLayer?.objects) {
          boundariesLayer.objects.forEach((obj) => {
            k.add([
              k.rect(obj.width, obj.height),
              k.pos(obj.x, obj.y),
              k.area(),
              k.body({ isStatic: true }),
              k.opacity(0),
              "boundary",
            ]);
          });
        }

        let spawnX = mapSprite.width / 2;
        let spawnY = mapSprite.height / 2;
        const spawnLayer = mapData.layers.find(
          (layer) => layer.name === "spawnpoint"
        );
        if (spawnLayer?.objects?.[0]) {
          spawnX = spawnLayer.objects[0].x;
          spawnY = spawnLayer.objects[0].y;
        }

        const chairDirections = ["up", "down", "left", "right"];
        chairDirections.forEach((direction) => {
          const chairLayer = mapData.layers.find(
            (layer) => layer.name === `chair-${direction}`
          );
          if (chairLayer?.objects) {
            chairLayer.objects.forEach((chair) => {
              k.add([
                k.rect(chair.width, chair.height),
                k.pos(chair.x, chair.y),
                k.area(),
                k.opacity(0),
                `chair-${direction}`,
                "chair",
              ]);
            });
          }
        });

        const promptText = k.add([
          k.text("Press E to sit", {
            size: 16,
            font: "sink",
            width: 200,
          }),
          k.pos(0, 0),
          k.anchor("center"),
          k.opacity(0),
          k.fixed(),
          "prompt",
        ]);

        const player = k.add([
          k.sprite("player"),
          k.pos(spawnX, spawnY),
          k.area({ width: 32, height: 32 }),
          k.anchor("center"),
          k.body(),
          {
            speed: PLAYER_SPEED,
            isMoving: false,
            direction: "down",
          },
        ]);
        playerRef.current = player;
        player.play("idle-down");
        k.camScale(1);

        const nameTag = k.add([
          k.text(playerName, { size: 16, color: k.rgb(255, 255, 255) }),
          k.pos(player.pos.x, player.pos.y - 20),
          k.anchor("center"),
        ]);

        WebSocketService.setOnPlayerUpdate((players) => {
          console.log("Received player updates:", players);
          const currentTime = Date.now();

          Object.entries(players).forEach(([id, playerData]) => {
            if (id !== WebSocketService.getCurrentPlayerId()) {
              if (!otherPlayers.current[id]) {
                if (
                  typeof playerData.x === "number" &&
                  typeof playerData.y === "number" &&
                  typeof playerData.direction === "string" &&
                  typeof playerData.isMoving === "boolean"
                ) {
                  const otherPlayer = k.add([
                    k.sprite("player"),
                    k.pos(playerData.x, playerData.y),
                    k.area({ width: 32, height: 32 }),
                    k.anchor("center"),
                    {
                      id,
                      username: playerData.username,
                      isMoving: playerData.isMoving,
                      direction: playerData.direction || "down",
                      targetX: playerData.x,
                      targetY: playerData.y,
                      previousX: playerData.x,
                      previousY: playerData.y,
                      lastUpdate: currentTime,
                      currentAnim: playerData.isMoving
                        ? `run-${playerData.direction || "down"}`
                        : `idle-${playerData.direction || "down"}`,
                    },
                  ]);
                  otherPlayer.play(
                    playerData.isMoving
                      ? `run-${playerData.direction || "down"}`
                      : `idle-${playerData.direction || "down"}`
                  );

                  const otherPlayerNameTag = k.add([
                    k.text(playerData.username, {
                      size: 16,
                      color: k.rgb(255, 255, 255),
                    }),
                    k.pos(playerData.x, playerData.y - 20),
                    k.anchor("center"),
                  ]);

                  otherPlayers.current[id] = {
                    sprite: otherPlayer,
                    nameTag: otherPlayerNameTag,
                    lastUpdate: currentTime,
                    previousX: playerData.x,
                    previousY: playerData.y,
                    currentAnim: playerData.isMoving
                      ? `run-${playerData.direction || "down"}`
                      : `idle-${playerData.direction || "down"}`,
                  };
                } else {
                  console.warn("Invalid player data:", id, playerData);
                }
              } else {
                const otherPlayerObj = otherPlayers.current[id];
                if (otherPlayerObj && otherPlayerObj.sprite) {
                  if (
                    typeof playerData.x === "number" &&
                    typeof playerData.y === "number" &&
                    typeof playerData.direction === "string" &&
                    typeof playerData.isMoving === "boolean"
                  ) {
                    otherPlayerObj.previousX = otherPlayerObj.sprite.pos.x;
                    otherPlayerObj.previousY = otherPlayerObj.sprite.pos.y;
                    otherPlayerObj.sprite.targetX = playerData.x;
                    otherPlayerObj.sprite.targetY = playerData.y;
                    otherPlayerObj.lastUpdate = currentTime;

                    const targetAnim = playerData.isMoving
                      ? `run-${playerData.direction || "down"}`
                      : `idle-${playerData.direction || "down"}`;

                    if (otherPlayerObj.currentAnim !== targetAnim) {
                      otherPlayerObj.sprite.play(targetAnim);
                      otherPlayerObj.currentAnim = targetAnim;
                    }
                  } else {
                    console.warn("Invalid player data:", id, playerData);
                  }
                }
              }
            }
          });

          if (cleanupTimeoutRef.current) {
            clearTimeout(cleanupTimeoutRef.current);
          }
          cleanupTimeoutRef.current = setTimeout(() => {
            Object.keys(otherPlayers.current).forEach((playerId) => {
              if (!players[playerId]) {
                console.log("Removing disconnected player:", playerId);
                const playerObj = otherPlayers.current[playerId];
                if (playerObj) {
                  if (playerObj.sprite) playerObj.sprite.destroy();
                  if (playerObj.nameTag) playerObj.nameTag.destroy();
                  delete otherPlayers.current[playerId];
                }
              }
            });
            cleanupTimeoutRef.current = null;
          }, CLEANUP_DELAY);
        });

        WebSocketService.connect(
          playerName,
          () => {
            console.log("Connected to game server");
            if (roomId) {
              WebSocketService.joinRoom(roomId)
                .then(() => {
                  console.log(`Joined room: ${roomId}`);
                })
                .catch((error) => {
                  console.error("Failed to join room:", error);
                });
            } else {
              WebSocketService.createRoom()
                .then((newRoomId) => {
                  console.log(`Created room: ${newRoomId}`);
                })
                .catch((error) => {
                  console.error("Failed to create room:", error);
                });
            }
          },
          (error) => {
            console.error("Failed to connect to server:", error);
          }
        );

        k.onUpdate(() => {
          const currentTime = Date.now();

          nameTag.pos.x = player.pos.x;
          nameTag.pos.y = player.pos.y - 20;

          let dx = 0,
            dy = 0;
          let newDirection = player.direction;
          let moving = false;

          if (!isPlayerSittingRef.current) {
            const chairs = k.get("chair");
            let nearestChair = null;
            let shortestDistance = Infinity;

            chairs.forEach((chair) => {
              const distance = playerRef.current.pos.dist(chair.pos);
              if (distance < CHAIR_PROXIMITY && distance < shortestDistance) {
                shortestDistance = distance;
                chairDirections.forEach((dir) => {
                  if (chair.is(`chair-${dir}`)) {
                    nearestChair = dir;
                  }
                });
              }
            });

            nearChairRef.current = nearestChair;
            const prompt = k.get("prompt")[0];

            if (nearestChair) {
              prompt.pos.x = playerRef.current.pos.x;
              prompt.pos.y = playerRef.current.pos.y - 40;
              prompt.opacity = 1;
            } else {
              prompt.opacity = 0;
            }
          }

          if (k.isKeyDown("left")) {
            dx = -1;
            newDirection = "left";
            moving = true;
          }
          if (k.isKeyDown("right")) {
            dx = 1;
            newDirection = "right";
            moving = true;
          }
          if (k.isKeyDown("up")) {
            dy = -1;
            newDirection = "up";
            moving = true;
          }
          if (k.isKeyDown("down")) {
            dy = 1;
            newDirection = "down";
            moving = true;
          }

          k.onKeyPress("e", () => {
            if (!playerRef.current) return;

            if (isPlayerSittingRef.current) {
              isPlayerSittingRef.current = false;
              playerRef.current.play(`idle-${playerRef.current.direction}`);
            } else if (nearChairRef.current) {
              isPlayerSittingRef.current = true;
              playerRef.current.play(`sit-${nearChairRef.current}`);
              playerRef.current.direction = nearChairRef.current;
            }
          });

          if (dx !== 0 && dy !== 0) {
            dx *= Math.SQRT1_2;
            dy *= Math.SQRT1_2;
          }

          if (moving) {
            player.move(dx * PLAYER_SPEED * k.dt(), dy * PLAYER_SPEED * k.dt());

            if (!player.isMoving || player.direction !== newDirection) {
              player.play(`run-${newDirection}`);
              player.isMoving = true;
              player.direction = newDirection;
            }
          } else if (player.isMoving) {
            player.play(`idle-${player.direction}`);
            player.isMoving = false;
          }

          const shouldSendUpdate =
            currentTime - lastUpdateRef.current >= UPDATE_INTERVAL ||
            player.isMoving !== prevMovingRef.current ||
            player.direction !== prevDirectionRef.current;

          if (shouldSendUpdate) {
            WebSocketService.sendMovementUpdate({
              x: player.pos.x,
              y: player.pos.y,
              direction: newDirection,
              isMoving: moving,
            });
            lastUpdateRef.current = currentTime;
            prevMovingRef.current = player.isMoving;
            prevDirectionRef.current = player.direction;
          }

          Object.values(otherPlayers.current).forEach((otherPlayer) => {
            const sprite = otherPlayer.sprite;
            const elapsed = currentTime - otherPlayer.lastUpdate;
            const lerpFactor = Math.min(elapsed / INTERPOLATION_DELAY, 1);

            sprite.pos.x = k.lerp(
              otherPlayer.previousX,
              sprite.targetX,
              lerpFactor
            );
            sprite.pos.y = k.lerp(
              otherPlayer.previousY,
              sprite.targetY,
              lerpFactor
            );

            if (otherPlayer.nameTag) {
              otherPlayer.nameTag.pos.x = sprite.pos.x;
              otherPlayer.nameTag.pos.y = sprite.pos.y - 20;
            }
          });

          const targetCamPos = player.pos;
          const currentCamPos = k.camPos();
          const smoothSpeed = 0.1;
          k.camPos(
            k.lerp(currentCamPos.x, targetCamPos.x, smoothSpeed),
            k.lerp(currentCamPos.y, targetCamPos.y, smoothSpeed)
          );
        });
      } catch (error) {
        console.error("Error loading map:", error);
      }
    };

    startGame();

    // Handle remote streams
    WebSocketService.onRemoteStreamAdded = (stream) => {
      setRemoteStreams((prevStreams) => [...prevStreams, stream]);
    };

    WebSocketService.onRemoteStreamRemoved = (streamId) => {
      setRemoteStreams((prevStreams) =>
        prevStreams.filter((stream) => stream.id !== streamId)
      );
    };

    // Cleanup on unmount
    return () => {
      console.log("Unmounting GameCanvas");
      if (activeCallRef.current) {
        console.log("Leaving video call...");
        leaveVideo();
        activeCallRef.current = false;
      }
      if (gameRef.current) {
        try {
          console.log("Destroying Kaboom instance...");
          gameRef.current.destroy();
        } catch (destroyError) {
          console.error("Error destroying Kaboom instance:", destroyError);
        }
      }
      if (WebSocketService.isConnected()) {
        console.log("Disconnecting WebSocket...");
        WebSocketService.disconnect();
      }
    };
  }, [playerName, roomId]);

  // Handlers to open and close chatbox
  const openChat = () => {
    setIsChatOpen(true);
  };
  const closeChat = () => {
    setIsChatOpen(false);
  };

  // Handlers to toggle camera, mic, and screen share
  const handleToggleCamera = async () => {
    const result = await toggleCamera();
    setIsCameraOn(result.isOn);
  };

  const handleToggleMic = async () => {
    const result = await toggleMic();
    setIsMicOn(result.isOn);
  };

  const handleToggleScreenShare = async () => {
    const result = await toggleScreenShare(AGORA_APP_ID, roomId);
    setIsScreenSharing(result.isScreenSharing);
  };

  return (
    <div className={styles.gameCanvasContainer}>
      {/* Kaboom Canvas */}
      <canvas ref={canvasRef} id="game" className={styles.gameCanvas} />

      {/* Video Calls Container */}
      <div className={styles.videoCallsContainer}>
        {/* Local Video */}
        <div id="local-video" className={styles.localVideo}></div>

        {/* Remote Videos */}
        <div id="remote-videos" className={styles.remoteVideos}>
          {remoteStreams.map((stream) => (
            <div
              key={stream.id}
              id={`remote-video-${stream.id}`}
              className={styles.remoteVideo}
            >
              <video
                ref={(video) => {
                  if (video) {
                    stream.play(video);
                  }
                }}
                autoPlay
                playsInline
                muted
              ></video>
            </div>
          ))}
        </div>
      </div>

      {/* Screen Share Video */}
      <div
        id="screen-video"
        className={styles.screenVideo}
        style={{ display: isScreenSharing ? 'block' : 'none' }}
      ></div>

      {/* Chatbox Toggle Button or Chatbox */}
      {isChatOpen ? (
        <div className={styles.chatBoxContainer}>
          <Chatbox
            roomId={roomId}
            playerName={playerName}
            onClose={closeChat}
          />
        </div>
      ) : (
        <button
          className={styles.chatToggleButton}
          onClick={openChat}
          aria-label="Open Chat"
        >
          <FaComments size={24} />
        </button>
      )}

      {/* Media Controls Container */}
      <div className={styles.mediaControlsContainer}>
        {/* Camera Toggle Button */}
        <button
          className={styles.mediaButton}
          onClick={handleToggleCamera}
          aria-label={isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
        >
          {isCameraOn ? <FaVideo size={24} /> : <FaVideoSlash size={24} />}
        </button>

        {/* Microphone Toggle Button */}
        <button
          className={styles.mediaButton}
          onClick={handleToggleMic}
          aria-label={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
        >
          {isMicOn ? (
            <FaMicrophone size={24} />
          ) : (
            <FaMicrophoneSlash size={24} />
          )}
        </button>

        {/* Screen Share Toggle Button */}
        <button
          className={styles.mediaButton}
          onClick={handleToggleScreenShare}
          aria-label={isScreenSharing ? "Stop Screen Sharing" : "Share Screen"}
        >
          {isScreenSharing ? (
            <FaStop size={24} />
          ) : (
            <FaDesktop size={24} />
          )}
        </button>

        {/* Discord Button */}
        <button
          className={styles.mediaButton}
          onClick={openDiscord}
          aria-label="Open Discord"
        >
          <FaDiscord size={24} />
        </button>
      </div>

      {/* Discord Dialog */}
      {isDiscordOpen && (
        <DiscordDialog
          selectedChannel={selectedDiscordChannel}
          onClose={closeDiscord}
        />
      )}
    </div>
  );
}

export default GameCanvas;
