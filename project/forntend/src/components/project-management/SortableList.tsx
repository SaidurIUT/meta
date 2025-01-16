// // src/components/SortableList.tsx
// "use client";

// import { useState, useEffect } from "react";
// import { Droppable, DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
// import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
// import { BoardList } from "@/services/listService";
// import { cardService, Card } from "@/services/cardService";
// import SortableCard from "@/components/project-management/SortableCard";

// interface SortableListProps {
//   list: BoardList;
//   boardId: string;
// }

// export default function SortableList({ list, boardId }: SortableListProps) {
//   const [cards, setCards] = useState<Card[]>([]);
//   const [newCardTitle, setNewCardTitle] = useState("");

//   useEffect(() => {
//     loadCards();
//   }, [list.id]);

//   const loadCards = async () => {
//     try {
//       const cardsData = await cardService.getCardsByListId(list.id);
//       setCards(cardsData);
//     } catch (error) {
//       console.error("Error loading cards:", error);
//     }
//   };

//   const handleCreateCard = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newCardTitle.trim()) return;

//     try {
//       await cardService.createCard({
//         title: newCardTitle,
//         listId: list.id,
//         boardId: boardId,
//       });
//       setNewCardTitle("");
//       loadCards();
//     } catch (error) {
//       console.error("Error creating card:", error);
//     }
//   };

//   const sensors = useSensors(useSensor(PointerSensor));

//   const handleDragEnd = async (event: DragEndEvent) => {
//     const { active, over } = event;

//     if (!over) return;

//     const oldIndex = cards.findIndex((card) => card.id === active.id);
//     const newIndex = cards.findIndex((card) => card.id === over.id);

//     if (oldIndex !== newIndex) {
//       const newCards = arrayMove(cards, oldIndex, newIndex);
//       setCards(newCards);

//       try {
//         await cardService.reorderCards(
//           newCards.map((card, index) => ({
//             id: card.id,
//             listId: list.id,
//             order: index,
//           }))
//         );
//       } catch (error) {
//         console.error("Error reordering cards:", error);
//       }
//     }
//   };

//   return (
//     <div className="w-72 bg-gray-100 p-4 rounded">
//       <h3 className="font-semibold mb-4">{list.title}</h3>
//       <DndContext
//         sensors={sensors}
//         collisionDetection={closestCenter}
//         onDragEnd={handleDragEnd}
//       >
//         <SortableContext
//           items={cards.map((card) => card.id)}
//           strategy={verticalListSortingStrategy}
//         >
//           <div className="space-y-2">
//             {cards.map((card) => (
//               <SortableCard key={card.id} card={card} />
//             ))}
//           </div>
//         </SortableContext>
//       </DndContext>

//       <form onSubmit={handleCreateCard} className="mt-4">
//         <input
//           type="text"
//           value={newCardTitle}
//           onChange={(e) => setNewCardTitle(e.target.value)}
//           placeholder="Enter card title"
//           className="border p-2 mr-2 rounded w-full"
//         />
//         <button
//           type="submit"
//           className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 w-full mt-2"
//         >
//           Add Card
//         </button>
//       </form>
//     </div>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { useParams } from "next/navigation";
import Link from "next/link";
import { boardService } from "@/services/boardService";
import { listService } from "@/services/listService";
import List from "@/components/project-management/List";
import AddList from "@/components/project-management/AddList";
import type { Board, List as ListType } from "@/types";

export default function BoardPage() {
  const params = useParams();
  const boardId = params?.boardId as string;

  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<ListType[]>([]);

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
      setBoard(boardData);
      setLists(listsData);
    } catch (error) {
      console.error("Error loading board data:", error);
    }
  };

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "list") {
      const newLists = Array.from(lists);
      const [reorderedList] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, reorderedList);

      setLists(newLists);

      try {
        await listService.reorderLists(
          newLists.map((list, index) => ({ id: list.id, order: index }))
        );
      } catch (error) {
        console.error("Error reordering lists:", error);
      }
    } else if (type === "card") {
      const sourceList = lists.find((list) => list.id === source.droppableId);
      const destList = lists.find((list) => list.id === destination.droppableId);

      if (!sourceList || !destList) return;

      const sourceCards = Array.from(sourceList.cards || []);
      const destCards = source.droppableId === destination.droppableId
        ? sourceCards
        : Array.from(destList.cards || []);

      const [movedCard] = sourceCards.splice(source.index, 1);
      destCards.splice(destination.index, 0, movedCard);

      const newLists = lists.map((list) => {
        if (list.id === source.droppableId) {
          return { ...list, cards: sourceCards };
        }
        if (list.id === destination.droppableId) {
          return { ...list, cards: destCards };
        }
        return list;
      });

      setLists(newLists);

      try {
        await listService.moveCard({
          cardId: draggableId,
          sourceListId: source.droppableId,
          destinationListId: destination.droppableId,
          newIndex: destination.index,
        });
      } catch (error) {
        console.error("Error moving card:", error);
      }
    }
  };

  if (!board) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/boards" className="text-blue-500 hover:underline mb-4 block">
          ← Back to Boards
        </Link>
        <h1 className="text-2xl font-bold">{board.title}</h1>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" type="list" direction="horizontal">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex gap-4 overflow-x-auto pb-4"
            >
              {lists.map((list, index) => (
                <List key={list.id} list={list} index={index} boardId={boardId} />
              ))}
              {provided.placeholder}
              <AddList boardId={boardId} onListAdded={loadBoardData} />
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}