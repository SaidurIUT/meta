package com.example.metatrello.dto;

import lombok.Data;

@Data
public class TodoDTO {
    private String id;
    private String content;
    private Boolean completed;
}