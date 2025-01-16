package com.meta.project.repository;

import com.meta.project.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BoardRepository extends JpaRepository<Board, String> {
    Board getBoardById(String boardId);
    // Fetch boards by user ID or title, useful for admin vs. regular users
//    List<Board> findByUsers_IdOrTitle(String userId, String guestBoardTitle);z

}