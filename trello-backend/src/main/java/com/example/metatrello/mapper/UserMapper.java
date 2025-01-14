package com.example.metatrello.mapper;

import com.example.metatrello.dto.UserDTO;
import com.example.metatrello.entity.User;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class UserMapper {

    public UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setBoardIds(user.getBoardIds());
        dto.setCardIds(user.getCardIds().stream().map(String::valueOf).collect(Collectors.toList())); // Convert Long to String
        return dto;
    }

    public User toEntity(UserDTO userDTO) {
        User user = new User();
        user.setId(userDTO.getId());
        user.setName(userDTO.getName());
        user.setEmail(userDTO.getEmail());
        return user;
    }
}