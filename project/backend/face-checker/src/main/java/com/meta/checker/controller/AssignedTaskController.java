package com.meta.checker.controller;

import com.meta.checker.dtos.AssignedTaskDTO;
import com.meta.checker.srevice.AssignedTaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/ac/v1/task")
@RequiredArgsConstructor
public class AssignedTaskController {
    private final AssignedTaskService taskService;

    @PostMapping
    public ResponseEntity<AssignedTaskDTO> createTask(@RequestBody AssignedTaskDTO taskDTO) {
        try {
            AssignedTaskDTO createdTask = taskService.createTask(taskDTO);
            return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{taskId}/status")
    public ResponseEntity<AssignedTaskDTO> updateTaskStatus(
            @PathVariable Long taskId,
            @RequestParam Integer status
    ) {
        try {
            AssignedTaskDTO updatedTask = taskService.updateTaskStatus(taskId, status);
            return ResponseEntity.ok(updatedTask);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/completed/day")
    public ResponseEntity<List<AssignedTaskDTO>> getCompletedTasksByDay(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime day
    ) {
        List<AssignedTaskDTO> tasks = taskService.getCompletedTasksByDay(day);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/completed/week")
    public ResponseEntity<List<AssignedTaskDTO>> getCompletedTasksByWeek(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime weekStart
    ) {
        List<AssignedTaskDTO> tasks = taskService.getCompletedTasksByWeek(weekStart);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<AssignedTaskDTO> getTaskById(@PathVariable Long taskId) {
        try {
            AssignedTaskDTO task = taskService.getTaskById(taskId);
            return ResponseEntity.ok(task);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping
    public ResponseEntity<List<AssignedTaskDTO>> getAllTasks() {
        List<AssignedTaskDTO> tasks = taskService.getAllTasks();
        return ResponseEntity.ok(tasks);
    }
}