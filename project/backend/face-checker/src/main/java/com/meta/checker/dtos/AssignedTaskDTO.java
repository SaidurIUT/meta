package com.meta.checker.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AssignedTaskDTO {
    private Long id;
    private String userId;
    private String officeId;
    private String cardId;
    private Integer taskStatus;
    private LocalDateTime createdAt;
}