package com.meta.office.controllers;


import com.meta.office.dtos.OfficeRoleDTO;
import com.meta.office.services.OfficeRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/os/v1/office-role")
public class OfficeRoleController {

    private final OfficeRoleService officeRoleService;

    @Autowired
    public OfficeRoleController(OfficeRoleService officeRoleService) {
        this.officeRoleService = officeRoleService;
    }

    @PostMapping
    public ResponseEntity<OfficeRoleDTO> assignRole(@RequestBody OfficeRoleDTO officeRoleDTO) {
        return ResponseEntity.ok(officeRoleService.assignRole(officeRoleDTO));
    }

    @GetMapping("/office/{officeId}")
    public ResponseEntity<List<OfficeRoleDTO>> getRolesByOffice(@PathVariable String officeId) {
        return ResponseEntity.ok(officeRoleService.getRolesByOffice(officeId));
    }


}
