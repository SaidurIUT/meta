package com.meta.office.services;

import com.meta.office.dtos.TeamRoleDTO;
import com.meta.office.enums.OfficeRoleType;
import com.meta.office.enums.TeamRoleType;

import java.util.List;

public interface TeamRoleService {
    TeamRoleDTO assignRole(TeamRoleDTO teamRoleDTO);
    List<TeamRoleDTO> getRolesByTeam(String teamId);
    List<TeamRoleDTO> getTeamRolesByMember(String memberId);
    List<TeamRoleDTO> getMembersByRoleInTeam(TeamRoleType roleType, String teamId);
    boolean hasMemberRoleInTeam(String memberId, TeamRoleType roleType, String teamId);
}