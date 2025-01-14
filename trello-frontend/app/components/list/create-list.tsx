

// 'use client';

// import React, { useRef, useState } from 'react';

// import { Plus, X } from 'lucide-react';
// import { toast } from 'sonner';

// import { createList } from '../../services/boardListService'; // Updated to use services folder

// import FormSubmit from '../atomic/form-submit';
// import InputForm from '../atomic/input-form';
// import { Button } from '../ui/button';

// const CreateList = ({ boardId }: { boardId: string }) => {
//   const formRef = useRef<HTMLFormElement>(null);
//   const [isEditable, setIsEditable] = useState(false);

//   const editEnable = () => {
//     setIsEditable(true);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault(); // Prevent the default form submission behavior
//     const formData = new FormData(formRef.current!);
//     const title = formData.get('title') as string;

//     if (!title.trim()) {
//       toast.error('Please add a list title');
//       return;
//     }

//     try {
//       const response = await createList({ title, boardId: Number(boardId) }); // Send request to the backend
//       formRef.current?.reset();
//       setIsEditable(false); // Close the form after submission
//       if (response.success) {
//         toast.success('List successfully added');
//       } else {
//         toast.error(response.error || 'List not created');
//       }
//     } catch (error) {
//       console.error('Error creating list:', error);
//       toast.error('List not created');
//     }
//   };

//   if (isEditable) {
//     return (
//       <li className="relative h-full w-[272px] shrink-0 select-none">
//         <form
//           onSubmit={handleSubmit}
//           ref={formRef}
//           className="space-y-4 rounded-md bg-white p-3 shadow-lg"
//         >
//           <div>
//             <InputForm id="title" label="List Title" name="title" type="text" />
//             <FormSubmit className="mt-2">Create List</FormSubmit>
//           </div>
//         </form>
//         <Button
//           className="absolute bottom-[10%] right-0 bg-white text-black hover:bg-white"
//           onClick={() => setIsEditable(false)}
//         >
//           <X className="h-4 w-4" />
//         </Button>
//       </li>
//     );
//   }

//   return (
//     <li className="h-full w-[272px] shrink-0 select-none">
//       <Button
//         className="flex w-full justify-between rounded-lg bg-white p-4 text-sm text-black transition hover:bg-slate-100"
//         onClick={editEnable}
//       >
//         Create List
//         <Plus className="mr-2 h-4 w-4" />
//       </Button>
//     </li>
//   );
// };

// export default CreateList;
'use client';

import React, { useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { createList } from '../../services/boardListService'; // Ensure this is correctly imported
import FormSubmit from '../atomic/form-submit';
import InputForm from '../atomic/input-form';
import { Button } from '../ui/button';

const CreateList = ({ boardId }: { boardId: string }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [isEditable, setIsEditable] = useState(false);

  const editEnable = () => {
    setIsEditable(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    const formData = new FormData(formRef.current!);
    const title = formData.get('title') as string;

    if (!title.trim()) {
      toast.error('Please add a list title');
      return;
    }

    try {
      const response = await createList({ title, boardId }); // Send the request to the backend
      formRef.current?.reset();
      setIsEditable(false); // Close the form after submission
      if (response.success) {
        toast.success(`List "${response.data.title}" successfully added`);
      } else {
        toast.error(response.error || 'List not created');
      }
    } catch (error) {
      console.error('Error creating list:', error);
      toast.error('List not created');
    }
  };

  if (isEditable) {
    return (
      <li className="relative h-full w-[272px] shrink-0 select-none">
        <form
          onSubmit={handleSubmit}
          ref={formRef}
          className="space-y-4 rounded-md bg-white p-3 shadow-lg"
        >
          <div>
            <InputForm id="title" label="List Title" name="title" type="text" />
            <FormSubmit className="mt-2">Create List</FormSubmit>
          </div>
        </form>
        <Button
          className="absolute bottom-[10%] right-0 bg-white text-black hover:bg-white"
          onClick={() => setIsEditable(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </li>
    );
  }

  return (
    <li className="h-full w-[272px] shrink-0 select-none">
      <Button
        className="flex w-full justify-between rounded-lg bg-white p-4 text-sm text-black transition hover:bg-slate-100"
        onClick={editEnable}
      >
        Create List
        <Plus className="mr-2 h-4 w-4" />
      </Button>
    </li>
  );
};

export default CreateList;
