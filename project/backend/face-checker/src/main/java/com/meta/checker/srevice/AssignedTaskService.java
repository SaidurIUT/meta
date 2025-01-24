package com.meta.checker.srevice;


import com.meta.checker.dtos.AssignedTaskDTO;
import com.meta.checker.entities.AssignedTask;

import java.time.LocalDateTime;
import java.util.List;

public interface AssignedTaskService {
    AssignedTaskDTO createTask(AssignedTaskDTO taskDTO) throws Exception;
    AssignedTaskDTO updateTaskStatus(Long taskId, Integer newStatus) throws Exception;
    List<AssignedTaskDTO> getCompletedTasksByDay(LocalDateTime day);
    List<AssignedTaskDTO> getCompletedTasksByWeek(LocalDateTime weekStart);
    AssignedTaskDTO getTaskById(Long taskId);
    List<AssignedTaskDTO> getAllTasks();
}