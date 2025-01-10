import React, { useEffect, useRef } from "react";
import kaboom from "kaboom";
import WebSocketService from "../services/WebSocketService";
import Chatbox from "./Chatbox";
import { joinVideo, leaveVideo } from "./AgoraCall"; // Ensure AgoraCall.js correctly exports these functions

const AGORA_APP_ID = "aa57b40426c74add85bb5dcae4557ef6"; // Replace with your Agora App ID

function GameCanvas({ playerName, roomId }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const otherPlayers = useRef({});
  const playerRef = useRef(null);
  const activeCallRef = useRef(false); // Tracks if a call is active
  const PROXIMITY_THRESHOLD = 100; // Distance to trigger a video call
  const PLAYER_SPEED = 3600;

  // Configuration Constants
  const UPDATE_INTERVAL = 1000 / 30; // 30 FPS update rate (~33ms)
  const INTERPOLATION_DELAY = 100; // ms to interpolate between states
  const CLEANUP_DELAY = 1000; // ms to debounce cleanup

  // Refs for tracking previous states to detect changes
  const prevMovingRef = useRef(false);
  const prevDirectionRef = useRef("down");

  // Ref for managing cleanup timeout separately
  const cleanupTimeoutRef = useRef(null);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    let isMounted = true;

    // Initialize Kaboom
    const k = kaboom({
      global: false,
      width: 800,
      height: 600,
      scale: 2,
      debug: false, // Disable debug in production
      background: [0, 0, 0, 1],
      canvas: canvasRef.current,
      stretch: true,
      letterbox: true,
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
      },
    });

    k.loadSprite("map", "/mapfinal1.png");

    // Check proximity and manage video calls
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
          joinVideo(AGORA_APP_ID, roomId); // Pass appId and roomId as channel
          activeCallRef.current = true;
          console.log("Video call started!");
          // Display local video
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
          // Hide local video
          const localVideo = document.getElementById("local-video");
          if (localVideo) localVideo.style.display = "none";
        } catch (error) {
          console.error("Error ending video call:", error);
        }
      }
    });

    const startGame = async () => {
      try {
        // Load map data
        const mapResponse = await fetch("/map.json");
        if (!mapResponse.ok)
          throw new Error(`Failed to load map.json: ${mapResponse.statusText}`);
        const mapData = await mapResponse.json();

        const map = k.add([k.pos(0, 0), k.anchor("topleft")]);

        const mapSprite = map.add([k.sprite("map"), k.anchor("topleft")]);

        // Set up boundaries
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

        // Initialize player position
        let spawnX = mapSprite.width / 2;
        let spawnY = mapSprite.height / 2;

        const spawnLayer = mapData.layers.find(
          (layer) => layer.name === "spawnpoint"
        );
        if (spawnLayer?.objects?.[0]) {
          spawnX = spawnLayer.objects[0].x;
          spawnY = spawnLayer.objects[0].y;
        }

        // Add player sprite
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

        // Add player name tag
        const nameTag = k.add([
          k.text(playerName, { size: 16, color: k.rgb(255, 255, 255) }),
          k.pos(player.pos.x, player.pos.y - 20),
          k.anchor("center"),
        ]);

        // Handle incoming player updates
        WebSocketService.setOnPlayerUpdate((players) => {
          console.log("Received player updates:", players); // Enhanced logging
          const currentTime = Date.now();

          Object.entries(players).forEach(([id, playerData]) => {
            // Exclude our own player using UUID
            if (id !== WebSocketService.getCurrentPlayerId()) {
              if (!otherPlayers.current[id]) {
                // Validate playerData
                if (
                  typeof playerData.x === "number" &&
                  typeof playerData.y === "number" &&
                  typeof playerData.direction === "string" &&
                  typeof playerData.isMoving === "boolean"
                ) {
                  // Add new player with interpolation state
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
                  console.log(
                    `Playing initial animation '${
                      playerData.isMoving
                        ? `run-${playerData.direction || "down"}`
                        : `idle-${playerData.direction || "down"}`
                    }' for player '${id}'`
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
                  console.warn(
                    `Invalid player data received for id ${id}:`,
                    playerData
                  );
                }
              } else {
                const otherPlayerObj = otherPlayers.current[id];
                if (otherPlayerObj && otherPlayerObj.sprite) {
                  // Validate playerData
                  if (
                    typeof playerData.x === "number" &&
                    typeof playerData.y === "number" &&
                    typeof playerData.direction === "string" &&
                    typeof playerData.isMoving === "boolean"
                  ) {
                    // Update previous positions for interpolation
                    otherPlayerObj.previousX = otherPlayerObj.sprite.pos.x;
                    otherPlayerObj.previousY = otherPlayerObj.sprite.pos.y;

                    // Update target positions and timestamp
                    otherPlayerObj.sprite.targetX = playerData.x;
                    otherPlayerObj.sprite.targetY = playerData.y;
                    otherPlayerObj.lastUpdate = currentTime;

                    // Determine target animation based on movement state
                    const targetAnim = playerData.isMoving
                      ? `run-${playerData.direction || "down"}`
                      : `idle-${playerData.direction || "down"}`;

                    // Update animation if it has changed
                    if (otherPlayerObj.currentAnim !== targetAnim) {
                      otherPlayerObj.sprite.play(targetAnim);
                      otherPlayerObj.currentAnim = targetAnim;
                      console.log(
                        `Playing animation '${targetAnim}' for player '${id}'`
                      );
                    }
                  } else {
                    console.warn(
                      `Invalid player data received for id ${id}:`,
                      playerData
                    );
                  }
                }
              }
            }
          });

          // Debounced cleanup to prevent rapid add/remove cycles
          if (cleanupTimeoutRef.current) {
            clearTimeout(cleanupTimeoutRef.current);
          }

          cleanupTimeoutRef.current = setTimeout(() => {
            Object.keys(otherPlayers.current).forEach((id) => {
              if (!players[id]) {
                console.log("Removing disconnected player:", id);
                const playerObj = otherPlayers.current[id];
                if (playerObj) {
                  if (playerObj.sprite) playerObj.sprite.destroy();
                  if (playerObj.nameTag) playerObj.nameTag.destroy();
                  delete otherPlayers.current[id];
                }
              }
            });
            cleanupTimeoutRef.current = null;
          }, CLEANUP_DELAY);
        });

        // Start WebSocket connection and join/create room
        WebSocketService.connect(
          playerName,
          () => {
            console.log("Connected to game server");
            if (roomId) {
              // Join existing room
              WebSocketService.joinRoom(roomId)
                .then(() => {
                  console.log(`Joined room: ${roomId}`);
                })
                .catch((error) => {
                  console.error("Failed to join room:", error);
                });
            } else {
              // Create new room
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
            console.error("Failed to connect to game server:", error);
          }
        );

        // Game loop
        k.onUpdate(() => {
          const currentTime = Date.now();

          // Update name tag position
          nameTag.pos.x = player.pos.x;
          nameTag.pos.y = player.pos.y - 20;

          let dx = 0,
            dy = 0;
          let newDirection = player.direction;
          let moving = false;

          // Handle movement input
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

          // Normalize diagonal movement
          if (dx !== 0 && dy !== 0) {
            dx *= Math.SQRT1_2;
            dy *= Math.SQRT1_2;
          }

          // Move player
          if (moving) {
            player.move(dx * PLAYER_SPEED * k.dt(), dy * PLAYER_SPEED * k.dt());

            // Update animation if direction changed or started moving
            if (!player.isMoving || player.direction !== newDirection) {
              player.play(`run-${newDirection}`);
              player.isMoving = true;
              player.direction = newDirection;
              console.log(`Player started moving: ${newDirection}`);
            }
          } else if (player.isMoving) {
            // Set to idle animation when not moving
            player.play(`idle-${player.direction}`);
            player.isMoving = false;
            console.log(`Player stopped moving: ${player.direction}`);
          }

          // Determine if a movement update should be sent
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
            console.log(
              `Sent movement update: ${JSON.stringify({
                x: player.pos.x,
                y: player.pos.y,
                direction: newDirection,
                isMoving: moving,
              })}`
            );
          }

          // Smooth interpolation for other players
          Object.values(otherPlayers.current).forEach((otherPlayer) => {
            if (otherPlayer && otherPlayer.sprite) {
              const sprite = otherPlayer.sprite;
              const elapsed = currentTime - otherPlayer.lastUpdate;
              const lerpFactor = Math.min(elapsed / INTERPOLATION_DELAY, 1); // Clamp to [0,1]

              // Interpolate positions based on elapsed time
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

              // Update name tag position
              if (otherPlayer.nameTag) {
                otherPlayer.nameTag.pos.x = sprite.pos.x;
                otherPlayer.nameTag.pos.y = sprite.pos.y - 20;
              }
            }
          });

          // Smooth camera follow
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

    // Cleanup on component unmount
    return () => {
      console.log("Cleanup: Unmounting GameCanvas component");

      // Leave video call if active
      if (activeCallRef.current) {
        console.log("Leaving video call...");
        leaveVideo();
        activeCallRef.current = false;
      }

      // Destroy Kaboom instance
      if (gameRef.current) {
        try {
          console.log("Destroying Kaboom instance...");
          gameRef.current.destroy();
          console.log("Kaboom instance destroyed");
        } catch (error) {
          console.error("Error destroying Kaboom instance:", error);
        }
      } else {
        console.warn("Kaboom instance is undefined during cleanup");
      }

      // Disconnect WebSocket
      if (WebSocketService.isConnected()) {
        console.log("Disconnecting WebSocket...");
        WebSocketService.disconnect();
        console.log("WebSocket disconnected");
      }
    };
  }, [playerName, roomId]);

  const videoStyles = {
    local: {
      display: "none", // Hidden by default
      position: "absolute",
      bottom: "10px",
      left: "10px",
      width: "200px",
      height: "150px",
      background: "black",
      border: "2px solid white",
      zIndex: 1000, // Ensure it appears above other elements
    },
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        id="game"
        style={{
          width: "100%",
          height: "100vh",
          display: "block",
        }}
      />
      {/* Local Video Container */}
      <div id="local-video" style={videoStyles.local}></div>
      <Chatbox roomId={roomId} playerName={playerName} />
      {/* Remote videos are dynamically created */}
    </>
  );
}

export default GameCanvas;
