package com.example.metatrello.controllers;

import com.example.metatrello.dto.BoardDTO;
import com.example.metatrello.dto.UserDTO;
import com.example.metatrello.service.BoardService;
import com.example.metatrello.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/boards")
@Validated
public class BoardController {

    @Autowired
    private BoardService boardService;

    @Autowired
    private UserService userService; // For additional user-related endpoints

    /**
     * Retrieves all boards accessible to a user.
     *
     * @param userId The ID of the user requesting the boards.
     * @return A ResponseEntity containing a list of BoardDTOs.
     */
    @GetMapping
    public ResponseEntity<List<BoardDTO>> getAllBoards(@RequestParam String userId) {
        List<BoardDTO> boards = boardService.getAllBoards(userId);
        return ResponseEntity.ok(boards);
    }

    /**
     * Creates a new board.
     *
     * @param boardDTO The DTO containing board details.
     * @return A ResponseEntity containing the created BoardDTO.
     */
    @PostMapping
    public ResponseEntity<BoardDTO> createBoard(@RequestBody BoardDTO boardDTO) {
        BoardDTO createdBoard = boardService.createBoard(boardDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBoard);
    }

    /**
     * Deletes a board by its ID.
     *
     * @param id The ID of the board to delete.
     * @return A ResponseEntity with HTTP status.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable String id) {
        boardService.deleteBoard(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Retrieves a board by its ID.
     *
     * @param id The ID of the board.
     * @return A ResponseEntity containing the BoardDTO if found.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getBoardById(@PathVariable String id) {
        try {
            return boardService.getBoardById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving board: " + e.getMessage());
        }
    }

    /**
     * Adds a member to a board by email.
     *
     * @param boardId The ID of the board.
     * @param email   The email of the user to add.
     * @return A ResponseEntity containing the updated BoardDTO if successful.
     */


    /**
     * Retrieves members of a specific board.
     *
     * @param boardId The ID of the board.
     * @return A ResponseEntity containing a list of UserDTOs.
     */
    @GetMapping("/{boardId}/members")
    public ResponseEntity<List<UserDTO>> getMembersOfBoard(@PathVariable String boardId) {
        List<UserDTO> members = boardService.getMembersOfBoard(boardId);
        return ResponseEntity.ok(members);
    }

    // Add more endpoints as needed
}
