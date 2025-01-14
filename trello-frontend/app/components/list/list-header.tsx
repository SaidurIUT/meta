


// 'use client';

// import React, { useRef, useState } from 'react';

// import { toast } from 'sonner';

// import { updateList } from '../../services/boardListService'; // Updated to use services folder
// import { bgColors } from '../../constants/colors';
// import { List } from '../../types';

// import InputForm from '../atomic/input-form';

// import ListOption from './list-option';

// const ListHeader = ({ list, index }: { list: List; index: number }) => {
//   const [title, setTitle] = useState(list?.title);
//   const [isEditable, setIsEditable] = useState(false);

//   const inputRef = useRef<HTMLInputElement>(null);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const updatedTitle = inputRef.current?.value || '';
//     const boardId = Number(list.boardId);
//     const id = Number(list.id);

//     if (updatedTitle === list.title) {
//       setIsEditable(false);
//       return;
//     }

//     try {
//       const response = await updateList({ id, boardId, title: updatedTitle });
//       setTitle(response.data.title); // Update the local state with the new title
//       setIsEditable(false); // Close the edit mode after submission
//       toast.success('List successfully updated');
//     } catch (error) {
//       console.error('Error updating list:', error);
//       toast.error('List not updated');
//     }
//   };

//   return (
//     <div
//       className={`sticky top-0 z-10 flex items-center justify-between gap-x-2 bg-slate-50 px-2 py-2`}
//       style={{ backgroundColor: bgColors[index] }}
//     >
//       {isEditable ? (
//         <form onSubmit={handleSubmit} className="w-full shadow-md">
//           <InputForm
//             id="title"
//             placeholder="Enter List name"
//             defaultValue={title}
//             className="h-7 truncate border-transparent bg-white px-2 py-1 text-sm font-medium transition hover:border-input focus:bg-white"
//             ref={inputRef}
//           />
//           <button type="submit" hidden />
//         </form>
//       ) : (
//         <div
//           className="h-7 w-full cursor-pointer border-transparent px-2.5 py-1 text-sm font-semibold"
//           onClick={() => setIsEditable(true)}
//         >
//           {title.toUpperCase()}
//         </div>
//       )}
//       <ListOption list={list} />
//     </div>
//   );
// };

// export default ListHeader;

'use client';

import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { updateList } from '../../services/boardListService';
import { bgColors } from '../../constants/colors';
import InputForm from '../atomic/input-form';
import ListOption from './list-option';

// Define proper types
interface ListType {
  id: string;
  title: string;
  boardId: string ;
  // Add other list properties as needed
}

interface ListHeaderProps {
  list: ListType;
  index: number;
}

const ListHeader = ({ list, index }: ListHeaderProps) => {
  const [title, setTitle] = useState(list?.title || '');
  const [isEditable, setIsEditable] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!list?.id) {
      toast.error('Invalid list data');
      return;
    }

    const updatedTitle = inputRef.current?.value?.trim() || '';
    
    if (!updatedTitle) {
      toast.error('Title cannot be empty');
      return;
    }

    if (updatedTitle === title) {
      setIsEditable(false);
      return;
    }

    try {
      // Convert IDs to numbers if they're strings
      const boardId = list.boardId;
      const listId = list.id;

      const response = await updateList({ 
        id: listId, 
        boardId: boardId, 
        title: updatedTitle 
      });

      if (response?.data?.title) {
        setTitle(response.data.title);
        toast.success('List successfully updated');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error updating list:', error);
      toast.error('Failed to update list');
      // Revert to previous title
      setTitle(list.title);
    } finally {
      setIsEditable(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditable(false);
    }
  };

  const getBgColor = (index: number) => {
    if (!bgColors || !bgColors.length) return 'bg-slate-50';
    return bgColors[index % bgColors.length];
  };

  return (
    <div
      className="sticky top-0 z-10 flex items-center justify-between gap-x-2 bg-slate-50 px-2 py-2"
      style={{ backgroundColor: getBgColor(index) }}
    >
      {isEditable ? (
        <form onSubmit={handleSubmit} className="w-full shadow-md">
          <InputForm
            id="title"
            placeholder="Enter List name"
            defaultValue={title}
            className="h-7 truncate border-transparent bg-white px-2 py-1 text-sm font-medium transition hover:border-input focus:bg-white"
            ref={inputRef}
            onKeyDown={handleKeyDown}
            
          />
          <button type="submit" hidden />
        </form>
      ) : (
        <div
          className="h-7 w-full cursor-pointer border-transparent px-2.5 py-1 text-sm font-semibold"
          onClick={() => setIsEditable(true)}
        >
          {title.toUpperCase()}
        </div>
      )}
      <ListOption list={list} />
    </div>
  );
};

export default ListHeader;