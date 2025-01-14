// import { getAllBoards } from '@/app/actions/boards';
// import BoardList from '../../components/boards/board-list';

// const Boards = async () => {
//   //

//   return (
//     <div className="flex min-h-[80vh] flex-wrap items-start justify-start bg-gradient-to-b from-purple-700 to-pink-500 p-4">
//       <BoardList boards={boards} />
//     </div>
//   );
// };

// export default Boards;

import { getAllBoards } from '../../services/boardService';
import BoardList from '../../components/boards/board-list';

const Boards = async () => {
  // Fetch all boards using the Spring Boot backend service
  let boards = [];
  try {
    const userEmail = "user@example.com"; // Replace with the current user's email if dynamic
    boards = await getAllBoards(userEmail);
  } catch (error) {
    console.error("Error fetching boards:", error);
  }

  return (
    <div className="flex min-h-[80vh] flex-wrap items-start justify-start bg-gradient-to-b from-purple-700 to-pink-500 p-4">
      <BoardList boards={boards} />
    </div>
  );
};

export default Boards;

