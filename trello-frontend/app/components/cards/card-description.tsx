
// 'use client';

// import React, { useCallback, useEffect, useState } from 'react';
// import dynamic from 'next/dynamic';
// import { useParams } from 'next/navigation';

// import parse from 'html-react-parser';
// import { toast } from 'sonner';

// import { updateCardDescription } from '../../services/cardService';
// import FormSubmit from '../atomic/form-submit';
// import { Button } from '../ui/button';

// import 'react-quill-new/dist/quill.snow.css';

// interface CardDetails {
//   cardData: {
//     id: number;
//     description?: string;
//   };
//   setCardData: (cardData: any) => void;
// }

// const modules = {
//   toolbar: [
//     [{ header: [1, 2, false] }],
//     ['bold', 'italic', 'underline', 'strike'],
//     [{ list: 'ordered' }, { list: 'bullet' }],
//     ['link', 'clean'],
//   ],
// };

// // Dynamically import ReactQuill with SSR disabled
// const ReactQuill = dynamic(() => import('react-quill-new'), {
//   ssr: false,
//   loading: () => (
//     <div className="h-[200px] w-full animate-pulse rounded-md bg-slate-100" />
//   ),
// });

// const CardDescription = ({ cardData, setCardData }: CardDetails) => {
//   const params = useParams();
//   const boardId = Number(params.boardId); // Ensure boardId is a number
//   const [isEditable, setIsEditable] = useState(false);
//   const [editorValue, setEditorValue] = useState('');
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     if (!cardData) return;
//     setMounted(true);
//     setEditorValue(cardData?.description || '');
//   }, [cardData]);

//   const handleSubmit = useCallback(
//     async (e: React.FormEvent) => {
//       e.preventDefault();
//       if (!cardData?.id) return;

//       try {
//         // API call to update description
//         const res = await updateCardDescription(cardData.id, editorValue);
//         if (res.success) {
//           setCardData(res.result); // Update card data with API response
//           setIsEditable(false);
//           toast.success('Card description successfully updated');
//         } else {
//           toast.error('Failed to update card description');
//         }
//       } catch (error) {
//         console.error('Error updating card description:', error);
//         toast.error('Card description not updated');
//       }
//     },
//     [editorValue, cardData?.id],
//   );

//   if (!mounted) {
//     return (
//       <div className="mb-[1rem]">
//         <div>
//           <p className="font-bold text-slate-700">Description</p>
//           <div className="mt-5 h-[200px] w-full animate-pulse rounded-md bg-slate-100" />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="mb-[1rem]">
//       <div>
//         <p className="flex cursor-pointer items-center gap-2 font-bold text-slate-700">
//           Description
//         </p>
//         <div className={`mt-5`}>
//           {isEditable ? (
//             <form onSubmit={handleSubmit} className="space-y-2">
//               <div className="min-h-[200px]">
//                 <ReactQuill
//                   value={editorValue}
//                   onChange={setEditorValue}
//                   placeholder="Add more details"
//                   modules={modules}
//                   theme="snow"
//                   className="w-full"
//                 />
//               </div>
//               <div className="mt-4 flex items-center justify-between">
//                 <FormSubmit>Save</FormSubmit>
//                 <Button
//                   type="button"
//                   onClick={() => setIsEditable(false)}
//                   size="sm"
//                   variant="ghost"
//                 >
//                   Cancel
//                 </Button>
//               </div>
//             </form>
//           ) : (
//             <div
//               role="button"
//               className="max-h-70 rounded-ms min-h-20 overflow-auto bg-slate-100 p-3 px-8 text-sm"
//               onClick={() => setIsEditable(true)}
//             >
//               {parse(editorValue || 'Add More Details')}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CardDescription;

// src/components/CardDescription.tsx

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

import parse from 'html-react-parser';
import { toast } from 'sonner';

import { updateCardDescription } from '../../services/cardService';
import FormSubmit from '../atomic/form-submit';
import { Button } from '../ui/button';

import 'react-quill-new/dist/quill.snow.css';

import { CardDTO } from '../../types'; // Import CardDTO

interface CardDetails {
  cardData: CardDTO;
  setCardData: (cardData: CardDTO) => void;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'clean'],
  ],
};

// Dynamically import ReactQuill with SSR disabled
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div className="h-[200px] w-full animate-pulse rounded-md bg-slate-100" />
  ),
});

const CardDescription = ({ cardData, setCardData }: CardDetails) => {
  const params = useParams();
  const boardId = params.boardId as string; // Ensure boardId is string
  const [isEditable, setIsEditable] = useState(false);
  const [editorValue, setEditorValue] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!cardData) return;
    setMounted(true);
    setEditorValue(cardData.description || '');
  }, [cardData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!cardData?.id) return;

      try {
        // API call to update description
        const updatedCard = await updateCardDescription(cardData.id, editorValue);
        setCardData(updatedCard); // Update card data with API response
        setIsEditable(false);
        toast.success('Card description successfully updated');
      } catch (error: any) {
        console.error('Error updating card description:', error);
        toast.error('Card description not updated');
      }
    },
    [editorValue, cardData?.id, setCardData],
  );

  if (!mounted) {
    return (
      <div className="mb-[1rem]">
        <div>
          <p className="font-bold text-slate-700">Description</p>
          <div className="mt-5 h-[200px] w-full animate-pulse rounded-md bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-[1rem]">
      <div>
        <p className="flex cursor-pointer items-center gap-2 font-bold text-slate-700">
          Description
        </p>
        <div className={`mt-5`}>
          {isEditable ? (
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="min-h-[200px]">
                <ReactQuill
                  value={editorValue}
                  onChange={setEditorValue}
                  placeholder="Add more details"
                  modules={modules}
                  theme="snow"
                  className="w-full"
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <FormSubmit>Save</FormSubmit>
                <Button
                  type="button"
                  onClick={() => setIsEditable(false)}
                  size="sm"
                  variant="ghost"
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div
              role="button"
              className="max-h-70 rounded-ms min-h-20 overflow-auto bg-slate-100 p-3 px-8 text-sm"
              onClick={() => setIsEditable(true)}
            >
              {parse(cardData.description || 'Add More Details')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardDescription;
