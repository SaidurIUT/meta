// // src/app/boards/page.tsx
// "use client";
// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { boardService } from "@/services/boardService";
// import type { Board } from "@/services/boardService";

// export default function BoardsPage() {
//   const [boards, setBoards] = useState<Board[]>([]);
//   const [newBoardTitle, setNewBoardTitle] = useState("");

//   useEffect(() => {
//     loadBoards();
//   }, []);

//   const loadBoards = async () => {
//     try {
//       const data = await boardService.getAllBoards();
//       setBoards(data);
//     } catch (error) {
//       console.error("Error loading boards:", error);
//     }
//   };

//   const handleCreateBoard = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newBoardTitle.trim()) return;

//     try {
//       await boardService.createBoard({
//         title: newBoardTitle,
//         image: "",
//       });
//       setNewBoardTitle("");
//       loadBoards();
//     } catch (error) {
//       console.error("Error creating board:", error);
//     }
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-6">My Boards</h1>

//       <form onSubmit={handleCreateBoard} className="mb-8">
//         <input
//           type="text"
//           value={newBoardTitle}
//           onChange={(e) => setNewBoardTitle(e.target.value)}
//           placeholder="Enter board title"
//           className="border p-2 mr-2 rounded"
//         />
//         <button
//           type="submit"
//           className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//         >
//           Create Board
//         </button>
//       </form>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {boards.map((board) => (
//           <Link
//             href={`/boards/${board.id}`}
//             key={board.id}
//             className="block p-4 border rounded hover:shadow-lg transition-shadow"
//           >
//             <h2 className="text-lg font-semibold">{board.title}</h2>
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// }
// src/app/boards/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { boardService } from "@/services/boardService";
import type { Board } from "@/services/boardService";

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [newBoardTitle, setNewBoardTitle] = useState("");

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      const data = await boardService.getAllBoards();
      setBoards(data);
    } catch (error) {
      console.error("Error loading boards:", error);
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    try {
      await boardService.createBoard({
        title: newBoardTitle,
        teamId: "1234",
      });
      setNewBoardTitle("");
      loadBoards();
    } catch (error) {
      console.error("Error creating board:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Boards</h1>

      <form onSubmit={handleCreateBoard} className="mb-8">
        <input
          type="text"
          value={newBoardTitle}
          onChange={(e) => setNewBoardTitle(e.target.value)}
          placeholder="Enter board title"
          className="border p-2 mr-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Board
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boards.map((board) => (
          <Link
            href={`/boards/${board.id}`} // Ensure this matches your dynamic route
            key={board.id}
            className="block p-4 border rounded hover:shadow-lg transition-shadow"
          >
            <h2 className="text-lg font-semibold">{board.title}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
