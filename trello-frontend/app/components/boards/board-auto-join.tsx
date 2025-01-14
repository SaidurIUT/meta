
'use client';

import { useEffect } from 'react';
import { addMemberToBoard } from '../../services/boardService';

export function BoardAutoJoin({ boardId }: { boardId: string }) {
  useEffect(() => {
    const joinBoard = async () => {
      try {
        const email = "user@example.com"; // Replace with the user's email or pass it dynamically if needed
        await addMemberToBoard(boardId, email); // Use Spring Boot service
        console.log(`User with email ${email} added to board ${boardId}`);
      } catch (error) {
        console.error('Error joining board:', error);
      }
    };

    joinBoard();
  }, [boardId]);

  return null;
}

