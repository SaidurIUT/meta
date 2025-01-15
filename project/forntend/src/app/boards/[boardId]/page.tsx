// src/app/boards/[boardId]/page.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { boardService } from "@/services/boardService";
import { listService } from "@/services/listService";
import { cardService } from "@/services/cardService";
import type { Board } from "@/services/boardService";
import type { BoardList } from "@/services/listService";
import type { Card } from "@/services/cardService";

export default function BoardPage({ params }: { params: { boardId: string } }) {
  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<BoardList[]>([]);
  const [newListTitle, setNewListTitle] = useState("");

  useEffect(() => {
    loadBoardData();
  }, [params.boardId]);

  const loadBoardData = async () => {
    try {
      const [boardData, listsData] = await Promise.all([
        boardService.getBoardById(params.boardId),
        listService.getLists(params.boardId),
      ]);
      setBoard(boardData);
      setLists(listsData);
    } catch (error) {
      console.error("Error loading board data:", error);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    try {
      await listService.createList({
        title: newListTitle,
        boardId: params.boardId,
      });
      setNewListTitle("");
      loadBoardData();
    } catch (error) {
      console.error("Error creating list:", error);
    }
  };

  if (!board) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/boards"
          className="text-blue-500 hover:underline mb-4 block"
        >
          ← Back to Boards
        </Link>
        <h1 className="text-2xl font-bold">{board.title}</h1>
      </div>

      <form onSubmit={handleCreateList} className="mb-8">
        <input
          type="text"
          value={newListTitle}
          onChange={(e) => setNewListTitle(e.target.value)}
          placeholder="Enter list title"
          className="border p-2 mr-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add List
        </button>
      </form>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {lists.map((list) => (
          <div
            key={list.id}
            className="flex-shrink-0 w-72 bg-gray-100 p-4 rounded"
          >
            <h3 className="font-semibold mb-4">{list.title}</h3>
            <div className="space-y-2">
              {list.cards?.map((card) => (
                <Link
                  href={`/boards/${params.boardId}/cards/${card.id}`}
                  key={card.id}
                  className="block p-3 bg-white rounded shadow hover:shadow-md transition-shadow"
                >
                  <h4 className="font-medium">{card.title}</h4>
                  {card.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {card.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
