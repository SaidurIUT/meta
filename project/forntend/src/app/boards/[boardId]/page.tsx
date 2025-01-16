
// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { useParams } from "next/navigation";
// import { boardService } from "@/services/boardService";
// import { listService } from "@/services/listService";
// import { cardService } from "@/services/cardService";
// import type { Board } from "@/services/boardService";
// import type { BoardList } from "@/services/listService";
// import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
// import List from "@/components/project-management/List";

// export default function BoardPage() {
//   const params = useParams();
//   const boardId = params?.boardId as string;

//   const [board, setBoard] = useState<Board | null>(null);
//   const [lists, setLists] = useState<BoardList[]>([]);
//   const [newListTitle, setNewListTitle] = useState("");

//   useEffect(() => {
//     if (boardId) {
//       loadBoardData();
//     }
//   }, [boardId]);

//   const loadBoardData = async () => {
//     try {
//       const [boardData, listsData] = await Promise.all([
//         boardService.getBoardById(boardId),
//         listService.getLists(boardId),
//       ]);
//       setBoard(boardData);
//       setLists(listsData);
//     } catch (error) {
//       console.error("Error loading board data:", error);
//     }
//   };

//   const handleCreateList = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newListTitle.trim()) return;

//     try {
//       await listService.createList({
//         title: newListTitle,
//         boardId: boardId,
//       });
//       setNewListTitle("");
//       loadBoardData();
//     } catch (error) {
//       console.error("Error creating list:", error);
//     }
//   };

//   const handleDragEnd = async (result: DropResult) => {
//     const { source, destination, type } = result;

//     if (!destination) return;

//     if (type === "list") {
//       // Reordering Lists
//       const reorderedLists = Array.from(lists);
//       const [movedList] = reorderedLists.splice(source.index, 1);
//       reorderedLists.splice(destination.index, 0, movedList);

//       setLists(reorderedLists);

//       // Update order in backend
//       try {
//         await listService.reorderLists(reorderedLists);
//       } catch (error) {
//         console.error("Error reordering lists:", error);
//       }
//     } else if (type === "card") {
//       // Moving Cards
//       const sourceListIndex = lists.findIndex(list => list.id === source.droppableId);
//       const destListIndex = lists.findIndex(list => list.id === destination.droppableId);

//       if (sourceListIndex === -1 || destListIndex === -1) {
//         console.error("Source or destination list not found.");
//         return;
//       }

//       const sourceList = lists[sourceListIndex];
//       const destList = lists[destListIndex];

//       const sourceCards = Array.from(sourceList.cards || []);
//       const destCards = Array.from(destList.cards || []);

//       const [movedCard] = sourceCards.splice(source.index, 1);
//       destCards.splice(destination.index, 0, movedCard);

//       const updatedLists = Array.from(lists);
//       updatedLists[sourceListIndex].cards = sourceCards;
//       updatedLists[destListIndex].cards = destCards;

//       setLists(updatedLists);

//       // Update card's listId and order in backend
//       try {
//         await cardService.updateCard(movedCard.id, {
//           listId: destList.id,
//           order: destination.index,
//         });
//       } catch (error) {
//         console.error("Error moving card:", error);
//       }
//     }
//   };

//   if (!board) {
//     return <div className="p-6">Loading...</div>;
//   }

//   return (
//     <div className="p-6">
//       <div className="mb-6">
//         <Link
//           href="/boards"
//           className="text-blue-500 hover:underline mb-4 block"
//         >
//           ← Back to Boards
//         </Link>
//         <h1 className="text-2xl font-bold">{board.title}</h1>
//       </div>

//       <form onSubmit={handleCreateList} className="mb-8">
//         <input
//           type="text"
//           value={newListTitle}
//           onChange={(e) => setNewListTitle(e.target.value)}
//           placeholder="Enter list title"
//           className="border p-2 mr-2 rounded"
//         />
//         <button
//           type="submit"
//           className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//         >
//           Add List
//         </button>
//       </form>

//       <DragDropContext onDragEnd={handleDragEnd}>
//         <Droppable
//           droppableId="all-lists"
//           direction="horizontal"
//           type="list"
//         >
//           {(provided) => (
//             <div
//               className="flex gap-4 overflow-x-auto pb-4"
//               {...provided.droppableProps}
//               ref={provided.innerRef}
//             >
//               {lists.map((list, index) => (
//                 <Draggable
//                   key={list.id}
//                   draggableId={list.id}
//                   index={index}
//                 >
//                   {(provided) => (
//                     <div
//                       ref={provided.innerRef}
//                       {...provided.draggableProps}
//                       {...provided.dragHandleProps}
//                     >
//                       <List list={list} boardId={boardId} />
//                     </div>
//                   )}
//                 </Draggable>
//               ))}
//               {provided.placeholder}
//             </div>
//           )}
//         </Droppable>
//       </DragDropContext>
//     </div>
//   );
// }


// src/app/boards/[boardId]/page.tsx
// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { useParams } from "next/navigation";
// import { boardService } from "@/services/boardService";
// import { listService } from "@/services/listService";
// import { cardService, Card } from "@/services/cardService";
// import type { Board } from "@/services/boardService";
// import type { BoardList } from "@/services/listService";
// import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
// import List from "@/components/project-management/List";

// export default function BoardPage() {
//   const params = useParams();
//   const boardId = params?.boardId as string;

//   const [board, setBoard] = useState<Board | null>(null);
//   const [lists, setLists] = useState<BoardList[]>([]);
//   const [newListTitle, setNewListTitle] = useState("");

//   useEffect(() => {
//     if (boardId) {
//       loadBoardData();
//     }
//   }, [boardId]);

//   const loadBoardData = async () => {
//     try {
//       const [boardData, listsData] = await Promise.all([
//         boardService.getBoardById(boardId),
//         listService.getLists(boardId),
//       ]);
//       setBoard(boardData);
//       setLists(listsData);
//     } catch (error) {
//       console.error("Error loading board data:", error);
//     }
//   };

//   const handleCreateList = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newListTitle.trim()) return;

//     try {
//       await listService.createList({
//         title: newListTitle,
//         boardId: boardId,
//       });
//       setNewListTitle("");
//       loadBoardData();
//     } catch (error) {
//       console.error("Error creating list:", error);
//     }
//   };
//   const handleDragEnd = async (result: DropResult) => {
//     const { source, destination, type } = result;
  
//     if (!destination) return;
  
//     if (type === "list") {
//       // Handle list reordering (if implemented)
//       // ...
//     } else if (type === "card") {
//       const sourceListIndex = lists.findIndex(list => list.id === source.droppableId);
//       const destListIndex = lists.findIndex(list => list.id === destination.droppableId);
  
//       if (sourceListIndex === -1 || destListIndex === -1) {
//         console.error("Source or destination list not found.");
//         return;
//       }
  
//       const sourceList = lists[sourceListIndex];
//       const destList = lists[destListIndex];
  
//       if (!sourceList || !destList) {
//         console.error("Source or destination list is undefined.");
//         return;
//       }
  
//       const sourceCards = Array.from(sourceList.cards || []);
//       const destCards = Array.from(destList.cards || []);
  
//       if (source.index >= sourceCards.length || destination.index > destCards.length) {
//         console.error("Invalid source or destination index.");
//         return;
//       }
  
//       const [movedCard] = sourceCards.splice(source.index, 1);
//       destCards.splice(destination.index, 0, movedCard);
  
//       const updatedLists = Array.from(lists);
//       updatedLists[sourceListIndex].cards = sourceCards;
//       updatedLists[destListIndex].cards = destCards;
  
//       setLists(updatedLists);
  
//       // Update card's listId and order in backend
//       try {
//         await cardService.updateCard(movedCard.id, {
//           listId: destList.id,
//           order: destination.index,
//         });
//       } catch (error) {
//         console.error("Error moving card:", error);
//         // Optionally, revert the state if the backend update fails
//       }
//     }
//   };
  

//   if (!board) {
//     return <div className="p-6">Loading...</div>;
//   }

//   return (
//     <div className="p-6">
//       <div className="mb-6">
//         <Link
//           href="/boards"
//           className="text-blue-500 hover:underline mb-4 block"
//         >
//           ← Back to Boards
//         </Link>
//         <h1 className="text-2xl font-bold">{board.title}</h1>
//       </div>

//       <form onSubmit={handleCreateList} className="mb-8">
//         <input
//           type="text"
//           value={newListTitle}
//           onChange={(e) => setNewListTitle(e.target.value)}
//           placeholder="Enter list title"
//           className="border p-2 mr-2 rounded"
//         />
//         <button
//           type="submit"
//           className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//         >
//           Add List
//         </button>
//       </form>

//       <DragDropContext onDragEnd={handleDragEnd}>
//         <Droppable
//           droppableId="all-lists"
//           direction="horizontal"
//           type="list"
//         >
//           {(provided) => (
//             <div
//               className="flex gap-4 overflow-x-auto pb-4"
//               {...provided.droppableProps}
//               ref={provided.innerRef}
//             >
//               {lists.map((list, index) => (
//                 <Draggable
//                   key={list.id}
//                   draggableId={list.id}
//                   index={index}
//                 >
//                   {(provided) => (
//                     <div
//                       ref={provided.innerRef}
//                       {...provided.draggableProps}
//                       {...provided.dragHandleProps}
//                     >
//                       <List list={list} boardId={boardId} />
//                     </div>
//                   )}
//                 </Draggable>
//               ))}
//               {provided.placeholder}
//             </div>
//           )}
//         </Droppable>
//       </DragDropContext>
//     </div>
//   );
// }

// src/app/boards/[boardId]/page.tsx
// page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { boardService } from "@/services/boardService";
import { listService, BoardList } from "@/services/listService";
import { cardService } from "@/services/cardService";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import List from "@/components/project-management/List";

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
      
      // Load cards for each list
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
      loadBoardData();
    } catch (error) {
      console.error("Error creating list:", error);
    }
  };


  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, type } = result;
  
    if (!destination) return;
  
    if (type === "list") {
      // ... list reordering logic remains the same
    } else if (type === "card") {
      try {
        const newLists = [...lists];
        const sourceList = newLists.find(list => list.id === source.droppableId);
        const destList = newLists.find(list => list.id === destination.droppableId);
  
        if (!sourceList || !destList || !sourceList.cards || !destList.cards) return;
  
        const [movedCard] = sourceList.cards.splice(source.index, 1);
        destList.cards.splice(destination.index, 0, movedCard);
  
        // Optimistically update the UI
        setLists(newLists);
  
        // Update the backend using the new endpoint
        await cardService.updateCardPosition(movedCard.id, {
          listId: destList.id,
          order: destination.index,
          boardId: boardId
        });
  
      } catch (error) {
        console.error("Error moving card:", error);
        // Revert the UI state and reload the data
        loadBoardData();
        
        // Show error message to user
        alert("Failed to move card. Please try again.");
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

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="all-lists" direction="horizontal" type="list">
          {(provided) => (
            <div
              className="flex gap-4 overflow-x-auto pb-4"
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
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}