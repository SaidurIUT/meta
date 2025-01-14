

// 'use client';

// import React, { useCallback } from 'react';
// import Image from 'next/image';
// import { useParams } from 'next/navigation';

// import { X } from 'lucide-react';
// import useSWR, { mutate } from 'swr';

// import { getCardById, removeMemberFromCard, updateCard } from '../../services/cardService';
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogTitle,
// } from '../ui/dialog';
// import { labels } from '../../constants/labels';
// import { fetcher } from '../../lib/fetcher';
// import { User } from '../../types';

// import CardActions from './card-actions';
// import CardCommentsInput from './card-comments';
// import CardDate from './card-date';
// import CardDescription from './card-description';
// import CardHeader from './card-header';
// import CardLinks from './card-links';
// import CardTodo from './card-todo';

// interface CardModalProps {
//   id: string;
//   isModal: boolean;
//   setIsModal: (isModal: boolean) => void;
// }

// const CardModal = ({ id, isModal, setIsModal }: CardModalProps) => {
//   const { data: cardData, mutate: mutateCard } = useSWR(`/api/cards/${id}`, fetcher, {
//     revalidateOnFocus: false,
//   });
//   const params = useParams();
//   const boardId = Number(params.boardId);

//   const getColor = (id: string) => {
//     const foundLabel = labels.find(label => label.id === id);
//     return foundLabel?.color;
//   };

//   const handleCardUpdate = useCallback(
//     async (updatedData: any) => {
//       await mutateCard(updatedData, false); // Optimistic update
//       await mutate(`/api/boards/${boardId}`); // Revalidate board data
//     },
//     [mutateCard, boardId],
//   );

//   const removeCardMember = async (user: User) => {
//     if (!user || !cardData) return;

//     const updatedUser = {
//       ...user,
//       cardIds: user.cardIds?.filter(id => id !== cardData.id),
//     };

//     const updatedCard = {
//       ...cardData,
//       userIds: cardData.userIds?.filter((id: any) => id !== user.id),
//       users: cardData.users?.filter((u: any) => u.id !== user.id),
//     };

//     await handleCardUpdate(updatedCard);

//     await removeMemberFromCard({
//       userId: user.id,
//       cardId: cardData.id,
//     });
//   };

//   return (
//     <Dialog open={isModal} onOpenChange={() => setIsModal(false)}>
//       <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px] md:max-w-[800px]">
//         <DialogTitle className="sr-only">Card Details</DialogTitle>
//         {!cardData ? (
//           <div className="flex h-48 items-center justify-center">
//             <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
//           </div>
//         ) : (
//           <div className="relative flex h-full flex-col space-y-8 overflow-hidden p-6">
//             <div>
//               <CardHeader cardData={cardData} setCardData={handleCardUpdate} />
//             </div>
//             <div className="flex gap-6">
//               <div className="w-[70%] space-y-6">
//                 <div className="space-y-3">
//                   <div className="flex flex-wrap gap-2">
//                     {cardData?.users?.map((user: User) => (
//                       <div
//                         key={user.id}
//                         className="group relative flex items-center gap-x-2 rounded-md border bg-gray-50/50 px-3 py-2 transition hover:bg-gray-100/50"
//                       >
//                         <div className="relative h-6 w-6">
//                           <Image
//                             src={user.image || ''}
//                             alt={user.name || ''}
//                             className="rounded-full"
//                             fill
//                           />
//                         </div>
//                         <span className="text-sm text-gray-700">
//                           {user.name}
//                         </span>
//                         <button
//                           onClick={() => removeCardMember(user)}
//                           className="absolute -right-2 -top-2 hidden rounded-full bg-rose-500 p-0.5 text-white transition group-hover:block hover:bg-rose-600"
//                           title="Remove member"
//                         >
//                           <X className="h-3 w-3" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//                 <div className="mt-4 max-w-[5rem]">
//                   <CardDate
//                     cardData={cardData}
//                     onCardUpdate={handleCardUpdate}
//                   />
//                 </div>
//                 <div className="space-y-3">
//                   <div className="flex flex-wrap gap-2">
//                     {cardData?.labels?.map((labelId: string) => (
//                       <div
//                         key={labelId}
//                         className="rounded-md px-3 py-1.5"
//                         style={{ backgroundColor: getColor(labelId) }}
//                       />
//                     ))}
//                   </div>
//                 </div>
//                 <div className="rounded-lg bg-gray-50/50">
//                   <CardDescription
//                     cardData={cardData}
//                     setCardData={handleCardUpdate}
//                   />
//                 </div>
//                 <div className="space-y-6">
//                   <CardLinks
//                     cardData={cardData}
//                     onCardUpdate={handleCardUpdate}
//                   />
//                   <CardTodo
//                     cardData={cardData}
//                     setCardData={handleCardUpdate}
//                   />
//                   <CardCommentsInput
//                     card={cardData}
//                     setCardData={handleCardUpdate}
//                   />
//                 </div>
//               </div>
//               <div className="w-[30%]">
//                 <div className="sticky top-4">
//                   <CardActions
//                     cardData={cardData}
//                     onCardUpdate={handleCardUpdate}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//         <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
//           <X className="h-4 w-4" />
//           <span className="sr-only">Close</span>
//         </DialogClose>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default CardModal;
// src/components/cards/card-modal.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CardDTO } from '../../types';
import { getCardById, removeMemberFromCard, updateCard } from '../../services/cardService';

import CardHeader from './card-header';
import CardDescription from './card-description';
import CardActions from './card-actions';
import CardLinks from './card-links';
import CardTodo from './card-todo';
import CardDate from './card-date';
import CardCommentsInput from './card-comments';

interface CardModalProps {
  id: string;
  isModal: boolean;
  setIsModal: (isModal: boolean) => void;
}

const CardModal: React.FC<CardModalProps> = ({ id, isModal, setIsModal }) => {
  const [cardData, setCardData] = useState<CardDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const card = await getCardById(id);
        setCardData(card);
      } catch (error) {
        console.error('Failed to fetch card:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isModal) {
      fetchCard();
    }
  }, [id, isModal]);

  // const handleCardUpdate = useCallback(
  //   async (updatedData: Partial<CardDTO>) => {
  //     if (!cardData) return;

  //     const updatedCard = { ...cardData, ...updatedData };
  //     try {
  //       setCardData(updatedCard); // Optimistic UI update
  //       await updateCard(updatedCard);
  //     } catch (error) {
  //       console.error('Failed to update card:', error);
  //     }
  //   },
  //   [cardData]
  // );

  const removeCardMember = async (userId: string) => {
    if (!cardData) return;

    const updatedCard = {
      ...cardData,
      userIds: cardData.userIds.filter((id) => id !== userId),
    };

    try {
      setCardData(updatedCard); // Optimistic UI update
      await removeMemberFromCard({ cardId: cardData.id, userId });
    } catch (error) {
      console.error('Failed to remove card member:', error);
    }
  };

  if (!isModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-3xl rounded bg-white p-6 overflow-auto max-h-full">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : cardData ? (
          <>
            <button
              onClick={() => setIsModal(false)}
              className="absolute top-4 right-4 p-2 text-white bg-red-500 rounded hover:bg-red-600"
            >
              Close
            </button>
            {/* <CardHeader cardData={cardData} setCardData={handleCardUpdate} />
            <div className="flex gap-6 mt-6">
              <div className="w-2/3 space-y-4">
                <CardDescription cardData={cardData} setCardData={handleCardUpdate} />
                <CardDate cardData={cardData} onCardUpdate={handleCardUpdate} />
                <CardLinks cardData={cardData} onCardUpdate={handleCardUpdate} />
                <CardTodo cardData={cardData} setCardData={handleCardUpdate} />
                <CardCommentsInput card={cardData} setCardData={handleCardUpdate} />
              </div>
              <div className="w-1/3 sticky top-4">
                <CardActions cardData={cardData} onCardUpdate={handleCardUpdate} />
              </div>
            </div> */}
          </>
        ) : (
          <p>No card data available</p>
        )}
      </div>
    </div>
  );
};

export default CardModal;
