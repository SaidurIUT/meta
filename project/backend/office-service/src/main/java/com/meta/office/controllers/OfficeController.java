package com.meta.office.controllers;


import com.meta.office.dtos.OfficeDTO;
import com.meta.office.services.OfficeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/os/v1/office")
public class OfficeController {
    private final OfficeService officeService;

    @Autowired
    public OfficeController(OfficeService officeService) {
        this.officeService = officeService;
    }

    @PostMapping
    public ResponseEntity<OfficeDTO> createOffice(@RequestBody OfficeDTO officeDTO) {
        return ResponseEntity.ok(officeService.createOffice(officeDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OfficeDTO> getOffice(@PathVariable String id) {
        return ResponseEntity.ok(officeService.getOffice(id));
    }


}
