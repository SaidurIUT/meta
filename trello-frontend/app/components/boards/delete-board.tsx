// 'use client';
// import React from 'react';
// import { useRouter } from 'next/navigation';

// import { MoreHorizontal } from 'lucide-react';
// import { toast } from 'sonner';

// import { deleteBoard } from '@/app/actions/boards';
// import {
//   Sheet,
//   SheetClose,
//   SheetContent,
//   SheetDescription,
//   SheetFooter,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from '../ui/sheet';
// import { Board } from '../../types';

// import { Button } from '../ui/button';

// const DeleteBoard = ({ board }: { board: Board }) => {
//   const router = useRouter();
//   const handleDelete = async () => {
//     if (confirm('Are you sure you want to delete this board?')) {
//       const data = { id: board.id };
//       const result: any = await deleteBoard(data);
//       router.push('/boards');
//       if (result?.error) {
//         toast.error('board not deleted');
//       }
//     }
//   };

//   return (
//     <Sheet>
//       <SheetTrigger asChild>
//         <Button variant="outline" className="h-auto w-auto p-2">
//           <MoreHorizontal />
//         </Button>
//       </SheetTrigger>
//       <SheetContent>
//         <SheetHeader>
//           <SheetTitle>Edit Board</SheetTitle>
//           <SheetDescription>Do you want to delete this board?</SheetDescription>
//         </SheetHeader>
//         <SheetFooter>
//           <SheetClose asChild>
//             <Button
//               type="submit"
//               className="mt-5 bg-red-500 text-white"
//               onClick={handleDelete}
//             >
//               Delete this board
//             </Button>
//           </SheetClose>
//         </SheetFooter>
//       </SheetContent>
//     </Sheet>
//   );
// };

// export default DeleteBoard;

'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

import { deleteBoard } from '../../services/boardService';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { Board } from '../../types';

import { Button } from '../ui/button';

const DeleteBoard = ({ board }: { board: Board }) => {
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this board?')) {
      try {
        await deleteBoard(Number(board.id)); // Call Spring Boot service
        toast.success('Board deleted successfully');
        router.push('/boards'); // Redirect to boards page
      } catch (error) {
        console.error('Error deleting board:', error);
        toast.error('Failed to delete the board. Please try again.');
      }
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="h-auto w-auto p-2">
          <MoreHorizontal />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Board</SheetTitle>
          <SheetDescription>Do you want to delete this board?</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose asChild>
            <Button
              type="submit"
              className="mt-5 bg-red-500 text-white"
              onClick={handleDelete}
            >
              Delete this board
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default DeleteBoard;

