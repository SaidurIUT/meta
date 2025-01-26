package com.meta.office.entities;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
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
public class Meeting {
    @Id
    private String id;

    private String teamId;

    private String title;

    private String description;

    private LocalDateTime MeetingDate;

    @Column(length = 99999)
    private String summary;


}
