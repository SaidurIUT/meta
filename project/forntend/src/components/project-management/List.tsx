
// "use client";

// import { useState, useEffect } from "react";
// import { Droppable, Draggable } from "@hello-pangea/dnd";
// import { cardService, Card } from "@/services/cardService";
// import CardComponent from "@/components/project-management/CardComponent";
// import AddCard from "@/components/project-management/AddCard";
// import { BoardList } from "@/services/listService";

// interface ListProps {
//   list: BoardList;
//   boardId: string;
// }

// export default function List({ list, boardId }: ListProps) {
//   const [cards, setCards] = useState<Card[]>([]);


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

//   // Removed handleDragEnd from here

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

//       <AddCard listId={list.id} boardId={boardId} />
//     </div>
//   );
// }
// List.tsx
"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Card } from "@/services/cardService";
import CardComponent from "@/components/project-management/CardComponent";
import AddCard from "@/components/project-management/AddCard";
import { BoardList } from "@/services/listService";

interface ListProps {
  list: BoardList;
  boardId: string;
  cards: Card[];
  onCardsUpdate: () => void;
}

export default function List({ list, boardId, cards, onCardsUpdate }: ListProps) {
  return (
    <div className="w-72 bg-gray-100 p-4 rounded">
      <h3 className="font-semibold mb-4">{list.title}</h3>
      <Droppable droppableId={list.id} type="card">
        {(provided) => (
          <div
            className="space-y-2"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {cards.map((card, index) => (
              <Draggable
                key={card.id}
                draggableId={card.id}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`bg-white rounded shadow p-3 mb-2 ${
                      snapshot.isDragging ? "opacity-50" : ""
                    }`}
                  >
                    <CardComponent card={card} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <AddCard
        listId={list.id}
        boardId={boardId}
        onCardAdded={onCardsUpdate}
      />
    </div>
  );
}