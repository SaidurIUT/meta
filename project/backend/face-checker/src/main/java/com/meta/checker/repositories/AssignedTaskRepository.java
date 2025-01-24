package com.meta.checker.repositories;

import com.meta.checker.entities.AssignedTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AssignedTaskRepository extends JpaRepository<AssignedTask, Long> {
    // Check if a user already has a task with status 101 in a specific card
    @Query("SELECT COUNT(t) FROM AssignedTask t WHERE t.userId = :userId AND t.cardId = :cardId AND t.taskStatus = 101")
    int countActiveTasksInCard(@Param("userId") String userId, @Param("cardId") String cardId);

    // Find completed tasks by day
    @Query("SELECT t FROM AssignedTask t WHERE t.taskStatus = 102 AND t.createdAt BETWEEN :startOfDay AND :endOfDay")
    List<AssignedTask> findCompletedTasksByDay(@Param("startOfDay") LocalDateTime startOfDay,
                                               @Param("endOfDay") LocalDateTime endOfDay);

    // Find completed tasks by week
    @Query("SELECT t FROM AssignedTask t WHERE t.taskStatus = 102 AND t.createdAt BETWEEN :startOfWeek AND :endOfWeek")
    List<AssignedTask> findCompletedTasksByWeek(@Param("startOfWeek") LocalDateTime startOfWeek,
                                                @Param("endOfWeek") LocalDateTime endOfWeek);
}