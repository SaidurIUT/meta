package com.example.metatrello.mapper;

import com.example.metatrello.dto.TodoDTO;
import com.example.metatrello.entity.Todo;
import org.springframework.stereotype.Component;

@Component
public class TodoMapper {

    /**
     * Converts a Todo entity to a TodoDTO.
     *
     * @param todo The Todo entity.
     * @return The corresponding TodoDTO.
     */
    public TodoDTO toDTO(Todo todo) {
        if (todo == null) {
            return null;
        }

        TodoDTO dto = new TodoDTO();
        dto.setId(todo.getId());
        dto.setContent(todo.getContent());
        dto.setCompleted(todo.getCompleted());

        return dto;
    }

    /**
     * Converts a TodoDTO to a Todo entity.
     *
     * @param todoDTO The TodoDTO.
     * @return The corresponding Todo entity.
     */
    public Todo toEntity(TodoDTO todoDTO) {
        if (todoDTO == null) {
            return null;
        }

        Todo todo = new Todo();
        todo.setId(todoDTO.getId());
        todo.setContent(todoDTO.getContent());
        todo.setCompleted(todoDTO.getCompleted() != null ? todoDTO.getCompleted() : false);

        return todo;
    }
}
