


// "use client";

// import { useState } from "react";
// import { cardService } from "@/services/cardService";

// interface AddCardProps {

//   listId: string;

//   boardId: string;

//   onCardAdded: () => void;

// }

// export default function AddCard({ listId, boardId }: AddCardProps) {
//   const [isAdding, setIsAdding] = useState(false);
//   const [newCardTitle, setNewCardTitle] = useState("");

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newCardTitle.trim()) return;

//     try {
//       await cardService.createCard({
//         title: newCardTitle,
//         listId: listId,
//         boardId: boardId,
//       });
//       setNewCardTitle("");
//       setIsAdding(false);
//       // Refresh the cards by re-fetching
//       // You can lift the state up or use a state management library
//       // For simplicity, we'll assume the parent component reloads the data
//     } catch (error) {
//       console.error("Error creating card:", error);
//     }
//   };

//   if (!isAdding) {
//     return (
//       <button
//         onClick={() => setIsAdding(true)}
//         className="text-gray-600 hover:bg-gray-200 py-1 px-2 rounded w-full text-left"
//       >
//         + Add a card
//       </button>
//     );
//   }

//   return (
//     <form onSubmit={handleSubmit}>
//       <textarea
//         value={newCardTitle}
//         onChange={(e) => setNewCardTitle(e.target.value)}
//         placeholder="Enter a title for this card..."
//         className="w-full p-2 mb-2 border rounded"
//         rows={3}
//         autoFocus
//       />
//       <div className="flex justify-between">
//         <button
//           type="submit"
//           className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded text-sm"
//         >
//           Add Card
//         </button>
//         <button
//           type="button"
//           onClick={() => setIsAdding(false)}
//           className="text-gray-600 hover:text-gray-800"
//         >
//           ✕
//         </button>
//       </div>
//     </form>
//   );
// }

"use client";

import { useState } from "react";
import { cardService } from "@/services/cardService";
import { Plus, X } from 'lucide-react';

interface AddCardProps {
  listId: string;
  boardId: string;
  onCardAdded: () => void;
}

export default function AddCard({ listId, boardId, onCardAdded }: AddCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;

    try {
      await cardService.createCard({
        title: newCardTitle,
        listId: listId,
        boardId: boardId,
        userId: "user123",
      });
      setNewCardTitle("");
      setIsAdding(false);
      onCardAdded();
    } catch (error) {
      console.error("Error creating card:", error);
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="flex items-center text-gray-600 hover:bg-gray-100 py-2 px-3 rounded-md w-full text-left transition-colors duration-200"
      >
        <Plus size={16} className="mr-2" />
        Add a card
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <textarea
        value={newCardTitle}
        onChange={(e) => setNewCardTitle(e.target.value)}
        placeholder="Enter a title for this card..."
        className="w-full p-2 mb-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
        autoFocus
      />
      <div className="flex justify-between">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded-md text-sm transition-colors duration-200"
        >
          Add Card
        </button>
        <button
          type="button"
          onClick={() => setIsAdding(false)}
          className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
        >
          <X size={20} />
        </button>
      </div>
    </form>
  );
}
