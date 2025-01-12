package com.map.MetaHive.controller;

import com.map.MetaHive.model.Player;
import com.map.MetaHive.model.Room;
import com.map.MetaHive.service.GameSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.Map;

@Controller
public class PlayerController {

    @Autowired
    private GameSessionService gameSessionService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/createRoom")
    public void createRoom(@Payload Map<String, Object> payload) {
        String username = (String) payload.get("username");
        String roomId = gameSessionService.createRoom();

        Map<String, Object> response = new HashMap<>();
        response.put("roomId", roomId);
        response.put("success", true);

        System.out.println("Room created: " + roomId);

        messagingTemplate.convertAndSend("/queue/roomCreated", response);
    }

    @MessageMapping("/joinRoom")
    public void joinRoom(SimpMessageHeaderAccessor headerAccessor, @Payload Map<String, Object> payload) {
        String username = (String) payload.get("username");
        String roomId = (String) payload.get("roomId");

        Map<String, Object> response = new HashMap<>();

        // Check if room exists
        if (!gameSessionService.roomExists(roomId)) {
            // If room doesn't exist, create it with the requested ID
            System.out.println("Room " + roomId + " doesn't exist. Creating new room.");
            Room newRoom = new Room(roomId);
            gameSessionService.addRoom(roomId, newRoom);
        }

        // At this point, the room definitely exists
        response.put("success", true);
        response.put("roomId", roomId);
        System.out.println("Player " + username + " joining room: " + roomId);

        messagingTemplate.convertAndSend("/queue/joinResult", response);
    }

    @MessageMapping("/register")
    public void registerPlayer(@Payload Player player) {
        if (player.getId() == null || player.getId().isEmpty()) {
            System.out.println("Invalid player ID received.");
            return;
        }
        if (!gameSessionService.roomExists(player.getRoomId())) {
            System.out.println("Attempt to register in a non-existent room: " + player.getRoomId());
            return;
        }

        System.out.println("Registering player: " + player.getUsername() + " with ID: " + player.getId() + " in room: " + player.getRoomId());
        gameSessionService.addPlayer(player);
        broadcastPlayerStates(player.getRoomId());
    }

    @MessageMapping("/move")
    public void movePlayer(@Payload Player playerMovement) {
        System.out.println("Received movement from player ID: " + playerMovement.getId() + " in room: " + playerMovement.getRoomId());
        Player existingPlayer = gameSessionService.getPlayerById(
                playerMovement.getRoomId(),
                playerMovement.getId()
        );

        if (existingPlayer != null) {
            existingPlayer.setX(playerMovement.getX());
            existingPlayer.setY(playerMovement.getY());
            existingPlayer.setDirection(playerMovement.getDirection());
            existingPlayer.setIsMoving(playerMovement.getIsMoving());
            existingPlayer.setAnimation(playerMovement.getAnimation());
            existingPlayer.setTimestamp(playerMovement.getTimestamp());

            broadcastPlayerStates(playerMovement.getRoomId());
        } else {
            System.out.println("Player ID not found: " + playerMovement.getId() + " in room: " + playerMovement.getRoomId());
        }
    }

    private void broadcastPlayerStates(String roomId) {
        Map<String, Player> players = gameSessionService.getPlayersInRoom(roomId);
        System.out.println("Broadcasting player states for room " + roomId + ": " + players.size() + " players");
        messagingTemplate.convertAndSend(
                "/topic/rooms/" + roomId + "/players",
                players
        );
    }
}