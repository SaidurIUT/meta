package com.example.metatrello.mapper;

import com.example.metatrello.dto.BoardListDTO;
import com.example.metatrello.entity.BoardList;
import org.springframework.stereotype.Component;

@Component
public class BoardListMapper {

    public BoardListDTO toDTO(BoardList boardList) {
        BoardListDTO dto = new BoardListDTO();
        dto.setId(boardList.getId());
        dto.setTitle(boardList.getTitle());
        dto.setOrder(boardList.getOrder());
        dto.setBoardId(boardList.getBoard().getId());
        return dto;
    }

    public BoardList toEntity(BoardListDTO boardListDTO) {
        BoardList boardList = new BoardList();
        boardList.setId(boardListDTO.getId());
        boardList.setTitle(boardListDTO.getTitle());
        boardList.setOrder(boardListDTO.getOrder());
        return boardList;
    }
}
