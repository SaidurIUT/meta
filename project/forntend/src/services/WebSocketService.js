import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// Helper function to generate UUIDs
function generateUUID() {
  // Public Domain/MIT
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

class WebSocketService {
  constructor() {
    this.client = null;
    this.connectionPromise = null;
    this.players = {};
    this.onPlayerUpdate = null;
    this.currentPlayer = null;
    this.currentRoom = null;
    this.playerId = generateUUID();
    this.movementInterval = null;
    this.lastUpdate = Date.now();
    this.updateRate = 1000 / 60; // 60 FPS
    this.maxRetries = 3;
    this.retryCount = 0;
    this.retryDelay = 2000;
    this.roomSubscription = null;
    this.username = null;
    this.debounceTimeout = null;
    this.lastMoveTime = 0;
    this.moveInterval = 1000 / 30; // 30Hz
  }

  /**
   * Establishes a WebSocket connection.
   * @param {string} username - The player's username.
   * @param {function} onConnected - Callback invoked upon successful connection.
   * @param {function} onError - Callback invoked upon connection error.
   * @returns {Promise}
   */
  async connect(username, onConnected, onError) {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.client = new Client({
          webSocketFactory: () => new SockJS("http://localhost:9502/ws"),
          debug: (str) => console.log("STOMP: " + str),
          reconnectDelay: this.retryDelay,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,

          onConnect: () => {
            console.log("WebSocket Connected Successfully");
            this.username = username;
            this.retryCount = 0;
            resolve();
            if (typeof onConnected === "function") {
              onConnected();
            }
          },

          onStompError: (frame) => {
            console.error("STOMP error:", frame);
            this.handleConnectionError(frame, reject, onError);
          },

          onWebSocketError: (event) => {
            console.error("WebSocket error:", event);
            this.handleConnectionError(event, reject, onError);
          },

          onDisconnect: () => {
            console.log("Disconnected from WebSocket");
            this.cleanup();
          },
        });

        this.client.activate();
      } catch (error) {
        this.handleConnectionError(error, reject, onError);
      }
    });

    return this.connectionPromise;
  }

  /**
   * Handles connection errors and manages reconnection attempts.
   * @param {Error|object} error - The error encountered.
   * @param {function} reject - The reject function from the connection promise.
   * @param {function} onError - Callback for error handling.
   */
  handleConnectionError(error, reject, onError) {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(
        `Retrying connection (${this.retryCount}/${this.maxRetries})...`
      );
      setTimeout(() => {
        this.connectionPromise = null;
        this.connect(this.username, null, onError);
      }, this.retryDelay);
    } else {
      this.cleanup();
      reject(error);
      if (typeof onError === "function") onError(error);
    }
  }

  /**
   * Creates a new room and subscribes to the room's player updates.
   * @returns {Promise<string>} - The created room ID.
   */
  async createRoom() {
    if (!this.client || !this.client.connected) {
      throw new Error("WebSocket not connected");
    }

    return new Promise((resolve, reject) => {
      const subscription = this.client.subscribe(
        "/queue/roomCreated",
        (message) => {
          const response = JSON.parse(message.body);
          if (response.success) {
            this.currentRoom = response.roomId;
            this.subscribeToRoom(response.roomId)
              .then(() => {
                subscription.unsubscribe();
                resolve(response.roomId);
              })
              .catch(reject);
          } else {
            subscription.unsubscribe();
            reject(new Error("Failed to create room"));
          }
        }
      );

      this.client.publish({
        destination: "/app/createRoom",
        body: JSON.stringify({ username: this.username }),
      });
    });
  }

  /**
   * Joins an existing room and subscribes to the room's player updates.
   * @param {string} roomId - The ID of the room to join.
   * @returns {Promise<boolean>} - Success status.
   */
  async joinRoom(roomId) {
    if (!this.client || !this.client.connected) {
      throw new Error("WebSocket not connected");
    }

    return new Promise((resolve, reject) => {
      const subscription = this.client.subscribe(
        "/queue/joinResult",
        (message) => {
          const response = JSON.parse(message.body);
          subscription.unsubscribe();

          if (response.success) {
            this.currentRoom = roomId;
            this.subscribeToRoom(roomId)
              .then(() => resolve(true))
              .catch(reject);
          } else {
            reject(new Error("Invalid room ID"));
          }
        }
      );

      this.client.publish({
        destination: "/app/joinRoom",
        body: JSON.stringify({
          username: this.username,
          roomId: roomId,
        }),
      });
    });
  }

  /**
   * Subscribes to the player updates of a specific room.
   * @param {string} roomId - The ID of the room to subscribe to.
   * @returns {Promise}
   */
  subscribeToRoom(roomId) {
    if (this.client?.connected) {
      if (this.roomSubscription) {
        this.roomSubscription.unsubscribe();
      }

      return new Promise((resolve, reject) => {
        console.log(`Subscribing to room: ${roomId}`);

        this.roomSubscription = this.client.subscribe(
          `/topic/rooms/${roomId}/players`,
          (message) => {
            try {
              const players = JSON.parse(message.body);
              if (typeof this.onPlayerUpdate === "function") {
                this.onPlayerUpdate(players);
              }
            } catch (error) {
              console.error("Error handling player update:", error);
            }
          }
        );

        // Register player after subscription to ensure the server is ready
        setTimeout(() => {
          this.registerInRoom(roomId).then(resolve).catch(reject);
        }, 500);
      });
    }
    return Promise.reject(new Error("WebSocket not connected"));
  }

  /**
   * Registers the current player in the specified room.
   * @param {string} roomId - The ID of the room to register in.
   * @returns {Promise}
   */
  registerInRoom(roomId) {
    if (!this.currentPlayer) {
      this.currentPlayer = {
        id: this.playerId, // Use the pre-generated UUID
        username: this.username,
        x: 0,
        y: 0,
        direction: "down",
        isMoving: false,
        animation: "idle-down",
        timestamp: Date.now(),
        roomId: roomId,
      };

      console.log("Registering player in room:", roomId);

      return new Promise((resolve, reject) => {
        try {
          this.client.publish({
            destination: "/app/register",
            body: JSON.stringify(this.currentPlayer),
          });
          resolve();
        } catch (error) {
          console.error("Error registering player:", error);
          reject(error);
        }
      });
    }
    return Promise.resolve();
  }

  /**
   * Sends a movement update to the server.
   * @param {object} playerData - The movement data of the player.
   */
  sendMovementUpdate(playerData) {
    const now = Date.now();
    if (now - this.lastMoveTime < this.moveInterval) {
      return; // Throttle updates to 30Hz
    }
    this.lastMoveTime = now;

    if (this.client?.connected && this.currentPlayer && this.currentRoom) {
      try {
        const newAnimation = playerData.isMoving
          ? `run-${playerData.direction}`
          : `idle-${playerData.direction}`;

        // Check if significant changes occurred
        const hasChanged =
          this.currentPlayer.x !== playerData.x ||
          this.currentPlayer.y !== playerData.y ||
          this.currentPlayer.direction !== playerData.direction ||
          this.currentPlayer.isMoving !== playerData.isMoving ||
          this.currentPlayer.animation !== newAnimation;

        if (!hasChanged) return; // Skip if no significant changes

        const updatedPlayer = {
          ...this.currentPlayer,
          ...playerData,
          animation: newAnimation,
          timestamp: now,
          roomId: this.currentRoom,
        };

        this.currentPlayer = updatedPlayer;

        this.client.publish({
          destination: "/app/move",
          body: JSON.stringify(updatedPlayer),
        });
      } catch (error) {
        console.error("Error sending player movement:", error);
      }
    }
  }

  /**
   * Initiates movement updates based on player input.
   * @param {object} playerData - The movement data of the player.
   */
  movePlayer(playerData) {
    this.sendMovementUpdate(playerData);

    if (playerData.isMoving) {
      this.startMovementUpdates(playerData);
    } else {
      this.stopMovementUpdates();
      this.sendMovementUpdate(playerData);
    }
  }

  /**
   * Starts sending periodic movement updates.
   * @param {object} playerData - The movement data of the player.
   */
  startMovementUpdates(playerData) {
    if (!this.movementInterval) {
      this.movementInterval = setInterval(() => {
        const now = Date.now();
        if (now - this.lastUpdate >= this.updateRate) {
          this.sendMovementUpdate(playerData);
          this.lastUpdate = now;
        }
      }, this.updateRate);
    }
  }

  /**
   * Stops sending periodic movement updates.
   */
  stopMovementUpdates() {
    if (this.movementInterval) {
      clearInterval(this.movementInterval);
      this.movementInterval = null;
    }
  }

  /**
   * Sets the callback for player updates.
   * @param {function} callback - The callback function.
   */
  setOnPlayerUpdate(callback) {
    this.onPlayerUpdate = callback;
  }

  /**
   * Disconnects the WebSocket and cleans up resources.
   */
  disconnect() {
    this.stopMovementUpdates();
    if (this.roomSubscription) {
      try {
        this.roomSubscription.unsubscribe();
      } catch (error) {
        console.error("Error unsubscribing from room:", error);
      }
    }
    if (this.client?.connected) {
      try {
        this.client.deactivate();
      } catch (error) {
        console.error("Error disconnecting WebSocket:", error);
      }
    }
    this.cleanup();
  }

  /**
   * Cleans up internal state.
   */
  cleanup() {
    this.players = {};
    this.currentPlayer = null;
    this.currentRoom = null;
    // Do not set playerId to null
    this.connectionPromise = null;
  }

  /**
   * Checks if the WebSocket is connected.
   * @returns {boolean} - Connection status.
   */
  isConnected() {
    return this.client?.connected ?? false;
  }

  /**
   * Retrieves the current room ID.
   * @returns {string|null} - The current room ID or null.
   */
  getCurrentRoom() {
    return this.currentRoom;
  }

  /**
   * Retrieves the current player data.
   * @returns {object|null} - The current player data or null.
   */
  getCurrentPlayer() {
    return this.currentPlayer;
  }

  /**
   * Retrieves the current player's UUID.
   * @returns {string|null} - The current player's UUID or null.
   */
  getCurrentPlayerId() {
    return this.playerId;
  }
}

export default new WebSocketService();
