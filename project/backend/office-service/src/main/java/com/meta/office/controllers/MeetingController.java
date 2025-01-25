package com.meta.office.controllers;

import com.meta.office.dtos.MeetingDTO;
import com.meta.office.dtos.MeetingResponseDTO;
import com.meta.office.services.MeetingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meetings")
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MeetingResponseDTO createMeeting(@RequestBody MeetingDTO meetingDTO) {
        return meetingService.createMeeting(meetingDTO);
    }

    @GetMapping
    public List<MeetingResponseDTO> getAllMeetings() {
        return meetingService.getAllMeetings();
    }

    @GetMapping("/{id}")
    public MeetingResponseDTO getMeetingById(@PathVariable Long id) {
        return meetingService.getMeetingById(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMeeting(@PathVariable Long id) {
        meetingService.deleteMeeting(id);
    }
}