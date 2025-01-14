

// 'use client';
// import React, { useRef, useState } from 'react';
// import { useParams } from 'next/navigation';

// import { Plus, X } from 'lucide-react';
// import { toast } from 'sonner';

// import { createCard } from '../../services/cardService'; // Updated import

// import FormSubmit from '../atomic/form-submit';
// import TextAreaForm from '../atomic/text-area-form';
// import { Button } from '../ui/button';

// const CreateCard = ({ listId }: { listId: string }) => {
//   const formRef = useRef<HTMLFormElement>(null);
//   const { boardId }: { boardId: string } = useParams();
//   const [isEditable, setIsEditable] = useState(false);

//   const editEnable = () => {
//     setIsEditable(true);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const formData = new FormData(formRef.current!);
//     const title = formData.get('title') as string;

//     if (!title.trim()) {
//       toast.error('Please add a card title');
//       return;
//     }

//     try {
//       const order = 1; // Replace with the correct logic to determine the order
//       const res = await createCard({
//         title,
//         order,
//         listId: Number(listId),
//         boardId: Number(boardId),
//         labels: [], // Optional, add default empty array if not provided
//         userIds: [], // Optional, add default empty array if not provided
//       });
      
//       if (res?.success) {
//         toast.success('Card successfully added');
//         setIsEditable(false);
//       } else {
//         toast.error(res?.error || 'Card not created');
//       }
//       formRef.current?.reset();
//     } catch (error) {
//       console.error('Error creating card:', error);
//       toast.error('Card not created');
//     }
//   };

//   if (isEditable) {
//     return (
//       <div className="relative h-full w-[272px] shrink-0 select-none bg-white">
//         <form
//           onSubmit={handleSubmit}
//           ref={formRef}
//           className="m-1 space-y-4 px-1 py-0.5"
//         >
//           <div>
//             <TextAreaForm id="title" placeholder="Card Title" />
//             <FormSubmit className="mt-2">Create Card</FormSubmit>
//           </div>
//         </form>
//         <Button
//           className="absolute bottom-0 right-0 bg-white text-black hover:bg-white"
//           onClick={() => setIsEditable(false)}
//         >
//           <X className="h-4 w-4" />
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="px-2 pt-2">
//       <Button
//         className="h-auto w-full bg-white px-2 py-1.5 text-sm text-muted-foreground hover:bg-white"
//         onClick={editEnable}
//       >
//         Create Card
//         <Plus className="mr-2 h-4 w-4" />
//       </Button>
//     </div>
//   );
// };

// export default CreateCard;

// src/components/CreateCard.tsx

'use client';
import React, { useRef, useState } from 'react';
import { useParams } from 'next/navigation';

import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

import { createCard } from '../../services/cardService'; // Updated import
import { CreateCardRequest } from '../../types'; // Import the DTO

import FormSubmit from '../atomic/form-submit';
import TextAreaForm from '../atomic/text-area-form';
import { Button } from '../ui/button';

const CreateCard = ({ listId }: { listId: string }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const { boardId } = useParams() as { boardId: string };
  const [isEditable, setIsEditable] = useState(false);

  const editEnable = () => {
    setIsEditable(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(formRef.current!);
    const title = formData.get('title') as string;

    if (!title.trim()) {
      toast.error('Please add a card title');
      return;
    }

    try {
      const newCard: CreateCardRequest = {
        title,
        listId, // Already a string
        boardId, // Already a string
        description: '', // Optional, set as needed
        labels: [], // Optional, can be populated from UI
        userIds: [], // Optional, can be populated from UI
        links: [], // Optional, can be populated from UI
        isCompleted: false, // Optional, defaults to false
        dateTo: undefined, // Optional, set as needed
      };

      const createdCard = await createCard(newCard);

      toast.success('Card successfully added');
      setIsEditable(false);
      formRef.current?.reset();
      
      // Optionally, trigger a parent component refresh or update
    } catch (error: any) {
      console.error('Error creating card:', error);
      toast.error('Card not created');
    }
  };

  if (isEditable) {
    return (
      <div className="relative h-full w-[272px] shrink-0 select-none bg-white">
        <form
          onSubmit={handleSubmit}
          ref={formRef}
          className="m-1 space-y-4 px-1 py-0.5"
        >
          <div>
            <TextAreaForm id="title" placeholder="Card Title" />
            <FormSubmit className="mt-2">Create Card</FormSubmit>
          </div>
        </form>
        <Button
          className="absolute bottom-0 right-0 bg-white text-black hover:bg-white"
          onClick={() => setIsEditable(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="px-2 pt-2">
      <Button
        className="h-auto w-full bg-white px-2 py-1.5 text-sm text-muted-foreground hover:bg-white"
        onClick={editEnable}
      >
        Create Card
        <Plus className="mr-2 h-4 w-4" />
      </Button>
    </div>
  );
};

export default CreateCard;

