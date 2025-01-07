package com.meta.office.controllers;

import com.meta.office.dtos.TeamDTO;
import com.meta.office.services.TeamService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/os/v1/team")
public class TeamController {
    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @PostMapping
    public ResponseEntity<TeamDTO> createTeam(@RequestBody TeamDTO teamDTO) {
        return ResponseEntity.ok(teamService.createTeam(teamDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeamDTO> getTeam(@PathVariable String id) {
        return ResponseEntity.ok(teamService.getTeam(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TeamDTO> updateTeam(@PathVariable String id, @RequestBody TeamDTO teamDTO) {
        return ResponseEntity.ok(teamService.updateTeam(id, teamDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeam(@PathVariable String id) {
        teamService.deleteTeam(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/office/{officeId}")
    public ResponseEntity<List<TeamDTO>> getTeamsByOffice(@PathVariable String officeId) {
        return ResponseEntity.ok(teamService.getTeamsByOffice(officeId));
    }

}