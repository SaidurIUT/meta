

// 'use client';

// import React from 'react';

// import { MoreHorizontal } from 'lucide-react';
// import { toast } from 'sonner';

// import { deleteList } from '../../services/boardListService'; // Updated to use services folder
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '../ui/popover';
// import { List } from '../../types';

// import FormSubmit from '../atomic/form-submit';
// import { Button } from '../ui/button';
// import { Separator } from '../ui/separator';

// const ListOption = ({ list }: { list: List }) => {
//   const handleDelete = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (confirm('Are you sure you want to delete this list?')) {
//       try {
//         if (!list?.id || !list?.boardId) {
//           toast.error('Something went wrong');
//           return;
//         }

//         // Call the backend API to delete the list
//         const response = await deleteList(list.id);

//         if (response.success) {
//           toast.success('List deleted successfully');
//         } else {
//           toast.error(response.error || 'Failed to delete the list');
//         }
//       } catch (error) {
//         console.error('Error deleting list:', error);
//         toast.error('List not deleted');
//       }
//     }
//   };

//   return (
//     <Popover>
//       <PopoverTrigger asChild>
//         <Button
//           variant="ghost"
//           className="h-auto w-auto p-2 transition-colors hover:bg-neutral-100"
//         >
//           <MoreHorizontal className="h-4 w-4" />
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent
//         className="w-56 px-0 pb-3 pt-3 shadow-md"
//         side="bottom"
//         align="end"
//       >
//         <div className="pb-3 text-center text-sm font-medium text-neutral-600">
//           List actions
//         </div>
//         <Separator className="mb-1" />
//         <form onSubmit={handleDelete}>
//           <FormSubmit
//             variant="ghost"
//             className="h-auto w-full justify-start rounded-none p-2 px-5 text-sm font-normal text-red-600 transition-colors hover:bg-red-50/75 hover:text-red-700"
//           >
//             Delete this list
//           </FormSubmit>
//         </form>
//       </PopoverContent>
//     </Popover>
//   );
// };

// export default ListOption;

'use client';

import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { deleteList } from '../../services/boardListService';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import FormSubmit from '../atomic/form-submit';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

interface ListType {
  id: string;
  boardId: string | number;
  title: string;
  // Add other properties as needed
}

interface ListOptionProps {
  list: ListType;
}

const ListOption = ({ list }: ListOptionProps) => {
  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!list?.id) {
        toast.error('Invalid list data');
        return;
      }

      const shouldDelete = confirm('Are you sure you want to delete this list?');
      
      if (!shouldDelete) {
        return;
      }

      // Convert ID to number if it's a string
      const listId =  list.id;
      
      const response = await deleteList(listId);

      if (response.success) {
        toast.success(`List "${list.title}" deleted successfully`);
        // You might want to trigger a refresh of the parent component here
      } else {
        throw new Error(response.error || 'Failed to delete the list');
      }
    } catch (error) {
      console.error('Error deleting list:', error);
      toast.error('Failed to delete list. Please try again.');
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto w-auto p-2 transition-colors hover:bg-neutral-100"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-56 px-0 pb-3 pt-3 shadow-md"
        side="bottom"
        align="end"
      >
        <div className="pb-3 text-center text-sm font-medium text-neutral-600">
          List actions
        </div>
        <Separator className="mb-1" />
        <form onSubmit={handleDelete}>
          <FormSubmit
            variant="ghost"
            className="h-auto w-full justify-start rounded-none p-2 px-5 text-sm font-normal text-red-600 transition-colors hover:bg-red-50/75 hover:text-red-700"
          >
            Delete this list
          </FormSubmit>
        </form>
      </PopoverContent>
    </Popover>
  );
};

export default ListOption;