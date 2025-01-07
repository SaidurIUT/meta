package com.meta.office.services;

import com.meta.office.dtos.TeamDTO;
import java.util.List;

public interface TeamService {
    TeamDTO createTeam(TeamDTO teamDTO);
    TeamDTO getTeam(String id);
    TeamDTO updateTeam(String id, TeamDTO teamDTO);
    void deleteTeam(String id);
    List<TeamDTO> getTeamsByOffice(String officeId);
}