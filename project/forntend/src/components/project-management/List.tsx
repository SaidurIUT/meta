
// // "use client";

// // import { useState, useEffect } from "react";
// // import { Droppable, Draggable } from "@hello-pangea/dnd";
// // import { cardService, Card } from "@/services/cardService";
// // import CardComponent from "@/components/project-management/CardComponent";
// // import AddCard from "@/components/project-management/AddCard";
// // import { BoardList } from "@/services/listService";

// // interface ListProps {
// //   list: BoardList;
// //   boardId: string;
// // }

// // export default function List({ list, boardId }: ListProps) {
// //   const [cards, setCards] = useState<Card[]>([]);


// //   useEffect(() => {
// //     loadCards();
// //   }, [list.id]);

// //   const loadCards = async () => {
// //     try {
// //       const cardsData = await cardService.getCardsByListId(list.id);
// //       setCards(cardsData);
// //     } catch (error) {
// //       console.error("Error loading cards:", error);
// //     }
// //   };

// //   // Removed handleDragEnd from here

// //   return (
// //     <div className="w-72 bg-gray-100 p-4 rounded">
// //       <h3 className="font-semibold mb-4">{list.title}</h3>
// //       <Droppable droppableId={list.id} type="card">
// //         {(provided) => (
// //           <div
// //             className="space-y-2"
// //             {...provided.droppableProps}
// //             ref={provided.innerRef}
// //           >
// //             {cards.map((card, index) => (
// //               <Draggable
// //                 key={card.id}
// //                 draggableId={card.id}
// //                 index={index}
// //               >
// //                 {(provided, snapshot) => (
// //                   <div
// //                     ref={provided.innerRef}
// //                     {...provided.draggableProps}
// //                     {...provided.dragHandleProps}
// //                     className={`bg-white rounded shadow p-3 mb-2 ${
// //                       snapshot.isDragging ? "opacity-50" : ""
// //                     }`}
// //                   >
// //                     <CardComponent card={card} />
// //                   </div>
// //                 )}
// //               </Draggable>
// //             ))}
// //             {provided.placeholder}
// //           </div>
// //         )}
// //       </Droppable>

// //       <AddCard listId={list.id} boardId={boardId} />
// //     </div>
// //   );
// // }
// // List.tsx
// "use client";

// import { Droppable, Draggable } from "@hello-pangea/dnd";
// import { Card } from "@/services/cardService";
// import CardComponent from "@/components/project-management/CardComponent";
// import AddCard from "@/components/project-management/AddCard";
// import { BoardList } from "@/services/listService";

// interface ListProps {
//   list: BoardList;
//   boardId: string;
//   cards: Card[];
//   onCardsUpdate: () => void;
// }

// export default function List({ list, boardId, cards, onCardsUpdate }: ListProps) {
//   return (
//     <div className="w-72 bg-gray-100 p-4 rounded">
//       <h3 className="font-semibold mb-4">{list.title}</h3>
//       <Droppable droppableId={list.id} type="card">
//         {(provided) => (
//           <div
//             className="space-y-2"
//             {...provided.droppableProps}
//             ref={provided.innerRef}
//           >
//             {cards.map((card, index) => (
//               <Draggable
//                 key={card.id}
//                 draggableId={card.id}
//                 index={index}
//               >
//                 {(provided, snapshot) => (
//                   <div
//                     ref={provided.innerRef}
//                     {...provided.draggableProps}
//                     {...provided.dragHandleProps}
//                     className={`bg-white rounded shadow p-3 mb-2 ${
//                       snapshot.isDragging ? "opacity-50" : ""
//                     }`}
//                   >
//                     <CardComponent card={card} />
//                   </div>
//                 )}
//               </Draggable>
//             ))}
//             {provided.placeholder}
//           </div>
//         )}
//       </Droppable>

//       <AddCard
//         listId={list.id}
//         boardId={boardId}
//         onCardAdded={onCardsUpdate}
//       />
//     </div>
//   );
// }


"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Card as CardType } from "@/services/cardService";
import Card from "@/components/project-management/Card";
import AddCard from "@/components/project-management/AddCard";
import { BoardList } from "@/services/listService";
import { MoreHorizontal } from 'lucide-react';

interface ListProps {
  list: BoardList;
  boardId: string;
  cards: CardType[];
  onCardsUpdate: () => void;
  onCardClick: (cardId: string) => void;
}

export default function List({ list, boardId, cards, onCardsUpdate, onCardClick }: ListProps) {
  return (
    <div className="w-72 bg-gray-100 rounded-lg shadow">
      <div className="p-3 flex justify-between items-center border-b border-gray-200">
        <h3 className="font-semibold text-gray-700">{list.title}</h3>
        <button className="text-gray-500 hover:text-gray-700">
          <MoreHorizontal size={16} />
        </button>
      </div>
      <Droppable droppableId={list.id} type="card">
        {(provided) => (
          <div
            className="p-2 space-y-2 min-h-[50px]"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {cards.map((card, index) => (
              <Card key={card.id} card={card} index={index} onClick={onCardClick} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      <div className="p-2 border-t border-gray-200">
        <AddCard listId={list.id} boardId={boardId} onCardAdded={onCardsUpdate} />
      </div>
    </div>
  );
}

