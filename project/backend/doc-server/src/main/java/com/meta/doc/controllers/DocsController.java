package com.meta.doc.controllers;

import com.meta.doc.dtos.DocsDTO;
import com.meta.doc.services.DocsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ds/v1/docs")
public class DocsController {

    private final DocsService docsService;

    @Autowired
    public DocsController(DocsService docsService) {
        this.docsService = docsService;
    }

    @PostMapping
    public ResponseEntity<DocsDTO> createDoc(@RequestBody DocsDTO doc) {
        return ResponseEntity.ok(docsService.saveDocs(doc));
    }

    @GetMapping
    public ResponseEntity<List<DocsDTO>> getAllDocs() {
        return ResponseEntity.ok(docsService.getAllDocs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocsDTO> getDocById(@PathVariable String id) {
        return ResponseEntity.ok(docsService.getDocsById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DocsDTO> updateDoc(@PathVariable String id, @RequestBody DocsDTO doc) {
        return ResponseEntity.ok(docsService.updateDocs(id, doc));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDoc(@PathVariable String id) {
        docsService.deleteDocsById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<DocsDTO>> getDocsByTeamId(@PathVariable String teamId) {
        return ResponseEntity.ok(docsService.getDocsByTeamId(teamId));
    }

    @GetMapping("/office/{officeId}")
    public ResponseEntity<List<DocsDTO>> getDocsByOfficeId(@PathVariable String officeId) {
        return ResponseEntity.ok(docsService.getDocsByOfficeId(officeId));
    }
}
