

// 'use client';

// import React, { useState } from 'react';
// import { FaTools } from 'react-icons/fa';
// import { FiMessageCircle } from 'react-icons/fi';
// import { GoPaperclip } from 'react-icons/go';
// import { IoClose } from 'react-icons/io5';
// import Image from 'next/image';

// import { Draggable } from '@hello-pangea/dnd';
// import { toast } from 'sonner';

// import { updateCardLabel } from '../../services/cardService'; // Uncomment and use the service function
// import { labels } from '../../constants/labels';
// import { CardDTO, UserDTO } from '../../types';

// import CardDate from './card-date';
// import CardModal from './card-modal';
// import TimeTracker from './time-tracker';
// import { Button } from '../ui/button';

// const getColor = (id: string) => {
//   const foundLabel = labels.find(label => label.id === id);
//   return foundLabel?.color;
// };

// interface CardItemProps {
//   card: CardDTO;
//   index: number;
//   onCardUpdate: (card: CardDTO) => Promise<void>;
// }

// const CardItem: React.FC<CardItemProps> = ({ card, index, onCardUpdate }) => {
//   const [isModal, setIsModal] = useState(false);
//   const [isUpdating, setIsUpdating] = useState(false);

//   const handleRemoveLabel = async (labelId: string, e: React.MouseEvent) => {
//     e.stopPropagation(); // Prevent modal from opening
//     if (isUpdating) return;

//     try {
//       setIsUpdating(true);
//       const updatedLabels = card.labels.filter(id => id !== labelId);

//       // Optimistic update: Update the card in the parent state
//       const updatedCard = { ...card, labels: updatedLabels };
//       await onCardUpdate(updatedCard);

//       // API call to update labels in the backend
//       await updateCardLabel(card.id, updatedLabels);

//       toast.success('Label removed successfully');
//     } catch (error: any) {
//       console.error('Error removing label:', error);
//       toast.error('Failed to remove label');
//       // Optionally, revert the optimistic update
//       await onCardUpdate(card);
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   const handleCardClick = (e: React.MouseEvent) => {
//     e.preventDefault();
//     setIsModal(true);
//   };

//   return (
//     <>
//       <Draggable draggableId={card.id} index={index}>
//         {(provided) => (
//           <div
//             {...provided.draggableProps}
//             {...provided.dragHandleProps}
//             ref={provided.innerRef}
//             className={`group relative z-[1] flex cursor-pointer flex-col rounded-lg border bg-white p-3 shadow-sm hover:shadow-md ${
//               isUpdating && 'pointer-events-none opacity-50'
//             }`}
//             onClick={handleCardClick}
//           >
//             <div className="space-y-3">
//               {card.labels.length > 0 && (
//                 <div className="flex flex-wrap gap-1.5">
//                   {card.labels.map((labelId: string) => (
//                     <div
//                       key={labelId}
//                       className="group/label relative h-2 w-8 rounded-full"
//                       style={{ backgroundColor: getColor(labelId) }}
//                     >
//                       <button
//                         title="Remove label"
//                         onClick={e => handleRemoveLabel(labelId, e)}
//                         className="absolute -right-1 -top-1 hidden h-4 w-4 rounded-full bg-white text-gray-500 shadow-sm group-hover/label:block hover:text-gray-700"
//                         disabled={isUpdating}
//                       >
//                         <IoClose className="h-full w-full" />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               <h3 className="line-clamp-2 font-medium text-gray-900">{card.title}</h3>

//               <div className="max-w-[5rem]">
//                 <CardDate cardData={card} />
//               </div>

//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2 text-gray-500">
//                   {card.description && <GoPaperclip className="h-3.5 w-3.5" />}
//                   {card.comments.length > 0 && (
//                     <div className="flex items-center gap-1">
//                       <FiMessageCircle className="h-3.5 w-3.5" />
//                       <span className="text-xs">{card.comments.length}</span>
//                     </div>
//                   )}
//                   {card.isCompleted && <FaTools className="h-3.5 w-3.5" />}
//                 </div>

//                 {card.users && card.users.length > 0 && (
//                   <div className="flex items-center">
//                     {card.users.slice(0, 3).map((user: UserDTO) => (
//                       <div key={user.id} className="group relative">
//                         <Image
//                           src={user.image || '/default-avatar.png'}
//                           alt={user.name || 'User'}
//                           width={24}
//                           height={24}
//                           className="-ml-2 h-6 w-6 rounded-full ring-2 ring-white first:ml-0"
//                         />
//                         <div className="absolute left-full top-0 z-10 ml-2 hidden whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
//                           {user.name || 'User'}
//                         </div>
//                       </div>
//                     ))}
//                     {card.users.length > 3 && (
//                       <div className="group relative">
//                         <div className="-ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-xs font-medium text-white ring-2 ring-white">
//                           +{card.users.length - 3}
//                         </div>
//                         <div className="absolute left-full top-0 z-10 ml-2 hidden whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
//                           {card.users.length - 3} more members
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>

//               <div onClick={e => e.stopPropagation()}>
//                 <TimeTracker cardData={card} />
//               </div>
//             </div>
//           </div>
//         )}
//       </Draggable>

//       {isModal && <CardModal id={card.id} isModal={isModal} setIsModal={setIsModal} onCardUpdate={onCardUpdate} />}
//     </>
//   );
// };

// export default CardItem;


'use client';

import React, { useState } from 'react';
import { FaTools } from 'react-icons/fa';
import { FiMessageCircle } from 'react-icons/fi';
import { GoPaperclip } from 'react-icons/go';
import { IoClose } from 'react-icons/io5';
import Image from 'next/image';
import { Draggable } from '@hello-pangea/dnd';
import { toast } from 'sonner';

import { updateCardLabel } from '../../services/cardService';
import { labels } from '../../constants/labels';
import { CardDTO } from '../../types';

import CardDate from './card-date';
import CardModal from './card-modal';
import TimeTracker from './time-tracker';

const getColor = (labelId: string) => {
  const foundLabel = labels.find(label => label.id === labelId);
  return foundLabel?.color;
};

interface CardItemProps {
  card: CardDTO;
  index: number;
  onCardUpdate: (card: CardDTO) => Promise<void>;
}

const CardItem: React.FC<CardItemProps> = ({ card, index, onCardUpdate }) => {
  const [isModal, setIsModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRemoveLabel = async (labelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUpdating) return;

    try {
      setIsUpdating(true);
      const updatedLabels = card.labels.filter(id => id !== labelId);
      
      const updatedCard = { ...card, labels: updatedLabels };
      await onCardUpdate(updatedCard);
      await updateCardLabel(card.id, updatedLabels);
      
      toast.success('Label removed successfully');
    } catch (error: any) {
      console.error('Error removing label:', error);
      toast.error('Failed to remove label');
      await onCardUpdate(card);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModal(true);
  };

  return (
    <>
      <Draggable draggableId={card.id} index={index}>
        {(provided) => (
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            className={`group relative z-[1] flex cursor-pointer flex-col rounded-lg border bg-white p-3 shadow-sm hover:shadow-md ${
              isUpdating && 'pointer-events-none opacity-50'
            }`}
            onClick={handleCardClick}
          >
            <div className="space-y-3">
              {card.labels.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {card.labels.map((labelId: string) => (
                    <div
                      key={labelId}
                      className="group/label relative h-2 w-8 rounded-full"
                      style={{ backgroundColor: getColor(labelId) }}
                    >
                      <button
                        title="Remove label"
                        onClick={e => handleRemoveLabel(labelId, e)}
                        className="absolute -right-1 -top-1 hidden h-4 w-4 rounded-full bg-white text-gray-500 shadow-sm group-hover/label:block hover:text-gray-700"
                        disabled={isUpdating}
                      >
                        <IoClose className="h-full w-full" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <h3 className="line-clamp-2 font-medium text-gray-900">{card.title}</h3>

              {card.dateTo && (
                <div className="max-w-[5rem]">
                  <CardDate cardData={card} />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-500">
                  {card.description && <GoPaperclip className="h-3.5 w-3.5" />}
                  {card.comments.length > 0 && (
                    <div className="flex items-center gap-1">
                      <FiMessageCircle className="h-3.5 w-3.5" />
                      <span className="text-xs">{card.comments.length}</span>
                    </div>
                  )}
                  {card.isCompleted && <FaTools className="h-3.5 w-3.5" />}
                </div>

                {card.userIds && card.userIds.length > 0 && (
                  <div className="flex items-center">
                    {card.userIds.slice(0, 3).map((userId: string) => (
                      <div key={userId} className="group relative">
                        <Image
                          src="/default-avatar.png"
                          alt="User"
                          width={24}
                          height={24}
                          className="-ml-2 h-6 w-6 rounded-full ring-2 ring-white first:ml-0"
                        />
                      </div>
                    ))}
                    {card.userIds.length > 3 && (
                      <div className="group relative">
                        <div className="-ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-xs font-medium text-white ring-2 ring-white">
                          +{card.userIds.length - 3}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div onClick={e => e.stopPropagation()}>
                <TimeTracker cardData={card} />
              </div>
            </div>
          </div>
        )}
      </Draggable>

      {isModal && <CardModal id={card.id} isModal={isModal} setIsModal={setIsModal} onCardUpdate={onCardUpdate} />}
    </>
  );
};

export default CardItem;