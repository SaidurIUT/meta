package com.example.metatrello.dto;

import lombok.Data;

import java.util.Set;

@Data
public class BoardListDTO {
    private String id;
    private String title;
    private Integer order;
    private String boardId;
    private Set<CardDTO> cards;

}
