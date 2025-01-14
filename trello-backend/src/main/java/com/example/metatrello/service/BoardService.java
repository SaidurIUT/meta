package com.example.metatrello.service;

import com.example.metatrello.dto.BoardDTO;
import com.example.metatrello.dto.BoardListDTO;
import com.example.metatrello.dto.UserDTO;
import com.example.metatrello.entity.Board;
import com.example.metatrello.entity.BoardList;
import com.example.metatrello.entity.User;
import com.example.metatrello.exception.ResourceNotFoundException;
import com.example.metatrello.exception.ServiceException;
import com.example.metatrello.mapper.BoardMapper;
import com.example.metatrello.mapper.UserMapper;
import com.example.metatrello.repository.BoardListRepository;
import com.example.metatrello.repository.BoardRepository;
import com.example.metatrello.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BoardService {

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private BoardMapper boardMapper;

    @Autowired
    private BoardListRepository boardListRepository;


    /**
     * Retrieves all boards accessible to a user.
     * If the user is an admin (e.g., identified by a specific userId), return all boards.
     * Otherwise, return boards the user is a member of or specific guest boards.
     *
     * @param userId The ID of the user requesting the boards.
     * @return A list of BoardDTOs.
     */
    public List<BoardDTO> getAllBoards(String userId) {
        boolean isAdmin = "admin_user_id_here".equals(userId); // Replace with actual admin ID logic

        List<Board> boards;
        if (isAdmin) {
            boards = boardRepository.findAll();
        } else {
            boards = boardRepository.findByUsers_IdOrTitle(userId, "Guest Board");
        }

        return boards.stream()
                .map(boardMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Creates a new board.
     *
     * @param boardDTO The DTO containing board details.
     * @return The created BoardDTO.
     */
    public BoardDTO createBoard(BoardDTO boardDTO) {
        Board board = boardMapper.toEntity(boardDTO);
        return boardMapper.toDTO(boardRepository.save(board));
    }

    /**
     * Retrieves a board by its ID.
     *
     * @param id The ID of the board.
     * @return An Optional containing the BoardDTO if found.
     */
    public Optional<BoardDTO> getBoardById(String id) {
        return boardRepository.findById(id)
                .map(boardMapper::toDTO);
    }

    /**
     * Deletes a board by its ID.
     *
     * @param id The ID of the board to delete.
     */
    public void deleteBoard(String id) {
        if (!boardRepository.existsById(id)) {
            throw new RuntimeException("Board not found with ID: " + id);
        }
        boardRepository.deleteById(id);
    }

    /**
     * Adds a member to a board by email.
     *
     * @param boardId The ID of the board.
     * @param email   The email of the user to add.
     * @return An Optional containing the updated BoardDTO if successful.
     */
    public Optional<BoardDTO> addMemberToBoard(String boardId, String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        Optional<Board> boardOpt = boardRepository.findById(boardId);

        if (userOpt.isPresent() && boardOpt.isPresent()) {
            Board board = boardOpt.get();
            User user = userOpt.get();

            if (!board.getUsers().contains(user)) {
                board.getUsers().add(user);
                board.getUserIds().add(user.getId());
                board.getUserEmails().add(user.getEmail());
                return Optional.of(boardMapper.toDTO(boardRepository.save(board)));
            }
        }
        return Optional.empty();
    }

    /**
     * Retrieves members of a specific board.
     *
     * @param boardId The ID of the board.
     * @return A list of User entities associated with the board.
     */
    public List<UserDTO> getMembersOfBoard(String boardId) {
        return boardRepository.findById(boardId)
                .map(Board::getUsers)
                .orElse(List.of())
                .stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }
    public void reorderLists(List<BoardListDTO> lists) {
        try {
            for (BoardListDTO dto : lists) {
                BoardList existingList = boardListRepository.findById(dto.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("List not found with ID: " + dto.getId()));
                existingList.setOrder(dto.getOrder());
                boardListRepository.save(existingList);
            }
        } catch (Exception e) {
            throw new ServiceException("Failed to reorder lists.", e);
        }
    }


    // Inject UserRepository and UserMapper if needed for additional methods
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapper userMapper;
}
