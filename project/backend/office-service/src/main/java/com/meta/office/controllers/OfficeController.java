package com.meta.office.controllers;

import com.meta.office.dtos.OfficeDTO;
import com.meta.office.services.OfficeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

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

    @PutMapping("/{id}")
    public ResponseEntity<OfficeDTO> updateOffice(@PathVariable String id, @RequestBody OfficeDTO officeDTO) {
        return ResponseEntity.ok(officeService.updateOffice(id, officeDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOffice(@PathVariable String id) {
        officeService.deleteOffice(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<OfficeDTO>> getAllOffices() {
        return ResponseEntity.ok(officeService.getAllOffices());
    }

    @GetMapping("/user")
    public ResponseEntity<List<OfficeDTO>> getOfficesByUserId() {
        return ResponseEntity.ok(officeService.getOfficesByUserId());
    }
}
