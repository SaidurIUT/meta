package com.meta.office.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingDTO {

    private String teamId;
    private String meetingId;
    private String meetingLink;
    private LocalDateTime meetingDate;
    private List<String> importantTexts;
}