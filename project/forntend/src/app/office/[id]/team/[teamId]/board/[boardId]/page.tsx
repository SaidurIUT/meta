
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { boardService } from "@/services/boardService";
import { listService, BoardList } from "@/services/listService";
import { cardService } from "@/services/cardService";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import List from "@/components/project-management/List";
import CardDialog from "@/components/project-management/CardDialog";
import { Plus, ChevronLeft } from 'lucide-react';

interface Board {
  id: string;
  title: string;
  image: string;
}

export default function BoardPage() {
  const params = useParams();
  const boardId = params?.boardId as string;

  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<BoardList[]>([]);
  const [newListTitle, setNewListTitle] = useState("");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddingList, setIsAddingList] = useState(false);

  useEffect(() => {
    if (boardId) {
      loadBoardData();
    }
  }, [boardId]);

  const loadBoardData = async () => {
    try {
      const [boardData, listsData] = await Promise.all([
        boardService.getBoardById(boardId),
        listService.getLists(boardId),
      ]);

      const listsWithCards = await Promise.all(
        listsData.map(async (list) => {
          const cards = await cardService.getCardsByListId(list.id);
          return { ...list, cards };
        })
      );

      setBoard(boardData);
      setLists(listsWithCards);
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
        boardId: boardId,
      });
      setNewListTitle("");
      setIsAddingList(false);
      loadBoardData();
    } catch (error) {
      console.error("Error creating list:", error);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, type } = result;

    if (!destination) return;

    if (type === "list") {
      const newLists = Array.from(lists);
      const [reorderedList] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, reorderedList);
      setLists(newLists);
      await listService.reorderLists(newLists);
    } else if (type === "card") {
      const sourceList = lists.find((list) => list.id === source.droppableId);
      const destList = lists.find((list) => list.id === destination.droppableId);

      if (!sourceList || !destList) return;

      const newSourceCards = Array.from(sourceList.cards || []);
      const newDestCards = source.droppableId === destination.droppableId ? newSourceCards : Array.from(destList.cards || []);

      const [movedCard] = newSourceCards.splice(source.index, 1);
      newDestCards.splice(destination.index, 0, movedCard);

      const newLists = lists.map((list) => {
        if (list.id === sourceList.id) {
          return { ...list, cards: newSourceCards };
        }
        if (list.id === destList.id) {
          return { ...list, cards: newDestCards };
        }
        return list;
      });

      setLists(newLists);

      await cardService.updateCardPosition(movedCard.id, {
        listId: destList.id,
        order: destination.index,
        boardId: boardId,
      });
    }
  };

  const handleCardClick = (cardId: string) => {
    setSelectedCardId(cardId);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedCardId(null);
  };

  if (!board) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/boards" className="text-gray-500 hover:text-gray-700 mr-4">
              <ChevronLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{board.title}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="all-lists" direction="horizontal" type="list">
            {(provided) => (
              <div
                className="flex gap-6 overflow-x-auto pb-4"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {lists.map((list, index) => (
                  <Draggable key={list.id} draggableId={list.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <List
                          list={list}
                          boardId={boardId}
                          cards={list.cards || []}
                          onCardsUpdate={loadBoardData}
                          onCardClick={handleCardClick}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {isAddingList ? (
                  <form onSubmit={handleCreateList} className="w-72">
                    <input
                      type="text"
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      placeholder="Enter list title"
                      className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <div className="mt-2 flex justify-between">
                      <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200"
                      >
                        Add List
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingList(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsAddingList(true)}
                    className="w-72 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md inline-flex items-center transition-colors duration-200"
                  >
                    <Plus size={20} className="mr-2" />
                    Add List
                  </button>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </main>

      {selectedCardId && (
        <CardDialog
          cardId={selectedCardId}
          isOpen={isDialogOpen}
          onClose={closeDialog}
        />
      )}
    </div>
  );
}

