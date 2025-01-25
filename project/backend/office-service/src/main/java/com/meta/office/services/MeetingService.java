package com.meta.office.services;

import com.meta.office.dtos.MeetingDTO;
import com.meta.office.dtos.MeetingResponseDTO;
import com.meta.office.entities.Meeting;
import com.meta.office.repositories.MeetingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MeetingService {

    private final MeetingRepository meetingRepository;

    // Create a new meeting
    public MeetingResponseDTO createMeeting(MeetingDTO meetingDTO) {
        Meeting meeting = Meeting.builder()
                .teamId(meetingDTO.getTeamId())
                .meetingId(meetingDTO.getMeetingId())
                .meetingLink(meetingDTO.getMeetingLink())
                .meetingDate(meetingDTO.getMeetingDate())
                .importantTexts(meetingDTO.getImportantTexts())
                .build();

        Meeting savedMeeting = meetingRepository.save(meeting);

        return MeetingResponseDTO.builder()
                .id(savedMeeting.getId())
                .teamId(savedMeeting.getTeamId())
                .meetingId(savedMeeting.getMeetingId())
                .meetingLink(savedMeeting.getMeetingLink())
                .meetingDate(savedMeeting.getMeetingDate())
                .importantTexts(savedMeeting.getImportantTexts())
                .build();
    }

    // Get all meetings
    public List<MeetingResponseDTO> getAllMeetings() {
        return meetingRepository.findAll().stream()
                .map(meeting -> MeetingResponseDTO.builder()
                        .id(meeting.getId())
                        .teamId(meeting.getTeamId())
                        .meetingId(meeting.getMeetingId())
                        .meetingLink(meeting.getMeetingLink())
                        .meetingDate(meeting.getMeetingDate())
                        .importantTexts(meeting.getImportantTexts())
                        .build())
                .collect(Collectors.toList());
    }

    // Get meeting by ID
    public MeetingResponseDTO getMeetingById(Long id) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        return MeetingResponseDTO.builder()
                .id(meeting.getId())
                .teamId(meeting.getTeamId())
                .meetingId(meeting.getMeetingId())
                .meetingLink(meeting.getMeetingLink())
                .meetingDate(meeting.getMeetingDate())
                .importantTexts(meeting.getImportantTexts())
                .build();
    }

    // Delete meeting by ID
    public void deleteMeeting(Long id) {
        meetingRepository.deleteById(id);
    }
}