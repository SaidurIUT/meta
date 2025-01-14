package com.example.metatrello.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommentDTO {
    private String id;
    private String text;
    private String image;
    private String user;
    private String cardId; // Only include the card ID to prevent recursion
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
