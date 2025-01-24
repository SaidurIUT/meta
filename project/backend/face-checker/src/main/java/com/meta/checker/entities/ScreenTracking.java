package com.meta.checker.entities;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;


@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ScreenTracking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String officeId;

    private String userId;

    private Boolean doingAssignedTask;

    @Column(length = 9999)
    private String trackedScreenDetails;

    private LocalDateTime clickedAt;
}
