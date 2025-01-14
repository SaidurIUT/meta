package com.example.metatrello.mapper;

import com.example.metatrello.dto.CardDTO;
import com.example.metatrello.dto.CommentDTO;
import com.example.metatrello.dto.TodoDTO;
import com.example.metatrello.entity.Card;
import com.example.metatrello.entity.Comment;
import com.example.metatrello.entity.Todo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CardMapper {

    @Autowired
    private CommentMapper commentMapper;

    @Autowired
    private TodoMapper todoMapper;

    public CardDTO toDTO(Card card) {
        CardDTO dto = new CardDTO();
        dto.setId(card.getId());
        dto.setTitle(card.getTitle());
        dto.setDescription(card.getDescription());
        dto.setOrder(card.getOrder());
        dto.setListId(card.getBoardList().getId());
        dto.setBoardId(card.getBoard().getId());
        dto.setUserIds(card.getUserIds());
        dto.setLabels(card.getLabels());
        dto.setLinks(card.getLinks());
        dto.setIsCompleted(card.getIsCompleted());
        dto.setTrackedTimes(card.getTrackedTimes());
        dto.setDateTo(card.getDateTo());
        dto.setCreatedAt(card.getCreatedAt());
        dto.setUpdatedAt(card.getUpdatedAt());

        // Map comments
        if (card.getComments() != null) {
            List<CommentDTO> commentDTOs = card.getComments().stream()
                    .map(commentMapper::toDTO)
                    .collect(Collectors.toList());
            dto.setComments(commentDTOs);
        }

        // Map todos
        if (card.getTodos() != null) {
            List<TodoDTO> todoDTOs = card.getTodos().stream()
                    .map(todoMapper::toDTO)
                    .collect(Collectors.toList());
            dto.setTodos(todoDTOs);
        }

        return dto;
    }

    public Card toEntity(CardDTO cardDTO) {
        Card card = new Card();
        card.setId(cardDTO.getId());
        card.setTitle(cardDTO.getTitle());
        card.setDescription(cardDTO.getDescription());
        card.setOrder(cardDTO.getOrder());
        // Note: Board and BoardList are set in the service layer
        card.setUserIds(cardDTO.getUserIds());
        card.setLabels(cardDTO.getLabels());
        card.setLinks(cardDTO.getLinks());
        card.setIsCompleted(cardDTO.getIsCompleted());
        card.setTrackedTimes(cardDTO.getTrackedTimes());
        card.setDateTo(cardDTO.getDateTo());
        card.setCreatedAt(cardDTO.getCreatedAt());
        card.setUpdatedAt(cardDTO.getUpdatedAt());

        // Map comments
        if (cardDTO.getComments() != null) {
            List<Comment> comments = cardDTO.getComments().stream()
                    .map(commentMapper::toEntity)
                    .collect(Collectors.toList());
            card.setComments(comments);
        }

        // Map todos
        if (cardDTO.getTodos() != null) {
            List<Todo> todos = cardDTO.getTodos().stream()
                    .map(todoMapper::toEntity)
                    .collect(Collectors.toList());
            card.setTodos(todos);
        }

        return card;
    }
}
