package com.meta.checker.srevice.impl;

import com.meta.checker.dtos.AssignedTaskDTO;
import com.meta.checker.entities.AssignedTask;
import com.meta.checker.enums.TaskStatusType;
import com.meta.checker.repositories.AssignedTaskRepository;
import com.meta.checker.srevice.AssignedTaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssignedTaskServiceImpl implements AssignedTaskService {
    private final AssignedTaskRepository taskRepository;

    @Override
    @Transactional
    public AssignedTaskDTO createTask(AssignedTaskDTO taskDTO) throws Exception {
        // Check if user already has an active task (status 101) in the same card
        int activeTasksCount = taskRepository.countActiveTasksInCard(
                taskDTO.getUserId(),
                taskDTO.getCardId()
        );

        if (activeTasksCount > 0) {
            throw new Exception("User already has an active task in this card");
        }

        // Set creation timestamp
        taskDTO.setCreatedAt(LocalDateTime.now());

        // Convert DTO to entity
        AssignedTask task = new AssignedTask();
        BeanUtils.copyProperties(taskDTO, task);

        // Save the task
        AssignedTask savedTask = taskRepository.save(task);

        // Convert back to DTO
        AssignedTaskDTO savedTaskDTO = new AssignedTaskDTO();
        BeanUtils.copyProperties(savedTask, savedTaskDTO);

        return savedTaskDTO;
    }

    @Override
    @Transactional
    public AssignedTaskDTO updateTaskStatus(Long taskId, Integer newStatus) throws Exception {
        AssignedTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new Exception("Task not found"));

        // If trying to set status to 101 (Working), check existing tasks
        if (newStatus == TaskStatusType.WORKING.getId()) {
            int activeTasksCount = taskRepository.countActiveTasksInCard(
                    task.getUserId(),
                    task.getCardId()
            );

            if (activeTasksCount > 0) {
                throw new Exception("User already has an active task in this card");
            }
        }

        task.setTaskStatus(newStatus);
        AssignedTask updatedTask = taskRepository.save(task);

        AssignedTaskDTO updatedTaskDTO = new AssignedTaskDTO();
        BeanUtils.copyProperties(updatedTask, updatedTaskDTO);

        return updatedTaskDTO;
    }

    @Override
    public List<AssignedTaskDTO> getCompletedTasksByDay(LocalDateTime day) {
        LocalDateTime startOfDay = day.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        return taskRepository.findCompletedTasksByDay(startOfDay, endOfDay)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AssignedTaskDTO> getCompletedTasksByWeek(LocalDateTime weekStart) {
        LocalDateTime startOfWeek = weekStart.toLocalDate().atStartOfDay();
        LocalDateTime endOfWeek = startOfWeek.plusDays(7);

        return taskRepository.findCompletedTasksByWeek(startOfWeek, endOfWeek)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AssignedTaskDTO getTaskById(Long taskId) {
        AssignedTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        return convertToDTO(task);
    }

    @Override
    public List<AssignedTaskDTO> getAllTasks() {
        return taskRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Helper method to convert entity to DTO
    private AssignedTaskDTO convertToDTO(AssignedTask task) {
        AssignedTaskDTO dto = new AssignedTaskDTO();
        BeanUtils.copyProperties(task, dto);
        return dto;
    }
}