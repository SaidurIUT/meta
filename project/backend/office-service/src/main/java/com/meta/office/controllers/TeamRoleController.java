package com.meta.office.controllers;

import com.meta.office.dtos.TeamRoleDTO;
import com.meta.office.services.TeamRoleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/os/v1/team-role")
public class TeamRoleController {
    private final TeamRoleService teamRoleService;

    public TeamRoleController(TeamRoleService teamRoleService) {
        this.teamRoleService = teamRoleService;
    }

    @PostMapping
    public ResponseEntity<TeamRoleDTO> assignRole(@RequestBody TeamRoleDTO teamRoleDTO) {
        return ResponseEntity.ok(teamRoleService.assignRole(teamRoleDTO));
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<TeamRoleDTO>> getRolesByTeam(@PathVariable String teamId) {
        return ResponseEntity.ok(teamRoleService.getRolesByTeam(teamId));
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<TeamRoleDTO>> getTeamRolesByMember(@PathVariable String memberId) {
        return ResponseEntity.ok(teamRoleService.getTeamRolesByMember(memberId));
    }
}