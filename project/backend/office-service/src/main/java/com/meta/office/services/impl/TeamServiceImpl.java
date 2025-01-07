package com.meta.office.services.impl;

import com.meta.office.dtos.TeamDTO;
import com.meta.office.entities.Team;
import com.meta.office.repositories.TeamRepository;
import com.meta.office.services.TeamService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import java.util.UUID;
import java.util.List;

@Service
public class TeamServiceImpl implements TeamService {
    private final TeamRepository teamRepository;
    private final ModelMapper modelMapper;

    public TeamServiceImpl(TeamRepository teamRepository, ModelMapper modelMapper) {
        this.teamRepository = teamRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public TeamDTO createTeam(TeamDTO teamDTO) {
        teamDTO.setId(UUID.randomUUID().toString());
        Team team = modelMapper.map(teamDTO, Team.class);
        Team savedTeam = teamRepository.save(team);
        return modelMapper.map(savedTeam, TeamDTO.class);
    }

    @Override
    public TeamDTO getTeam(String id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        return modelMapper.map(team, TeamDTO.class);
    }

    @Override
    public TeamDTO updateTeam(String id, TeamDTO teamDTO) {
        if (!teamRepository.existsById(id)) {
            throw new RuntimeException("Team not found");
        }
        teamDTO.setId(id);
        Team team = modelMapper.map(teamDTO, Team.class);
        Team updatedTeam = teamRepository.save(team);
        return modelMapper.map(updatedTeam, TeamDTO.class);
    }

    @Override
    public void deleteTeam(String id) {
        teamRepository.deleteById(id);
    }

    @Override
    public List<TeamDTO> getTeamsByOffice(String officeId) {
        return teamRepository.findByOfficeId(officeId).stream()
                .map(team -> modelMapper.map(team, TeamDTO.class))
                .toList();
    }
}