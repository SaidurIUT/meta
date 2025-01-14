package com.example.metatrello.repository;

import com.example.metatrello.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);

    // Fetch users not in a specific board
    @Query("SELECT u FROM User u WHERE u.id NOT IN (SELECT bu.id FROM Board b JOIN b.users bu WHERE b.id = :boardId)")
    List<User> findUsersNotInBoard(String boardId);

    // Fetch users not assigned to a specific card within a board
//    @Query("SELECT u FROM User u WHERE u.id NOT IN (SELECT cu.id FROM Card c JOIN c.userIds cu WHERE c.id = :cardId AND c.board.id = :boardId)")
//    List<User> findUsersNotAssignedToCard(@Param("boardId") String boardId, @Param("cardId") String cardId);
}
