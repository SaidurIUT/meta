// 'use client';

// import { IoChevronDown, IoChevronUp } from 'react-icons/io5';

// import { cn } from '../../lib/utils';

// interface SubTitleProps {
//   title: string;
//   length?: number;
//   isOpen: boolean;
//   setIsOpen: (value: boolean) => void;
// }

// const SubTitle = ({ title, length, isOpen, setIsOpen }: SubTitleProps) => {
//   return (
//     <button
//       type="button"
//       onClick={() => setIsOpen(!isOpen)}
//       className={cn(
//         'group flex w-full items-center gap-2 rounded-md px-1 py-2 text-left text-sm font-semibold text-gray-700',
//         'hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500',
//       )}
//       aria-expanded={isOpen}
//     >
//       <span className="flex-1">{title}</span>
//       {length ? (
//         <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 group-hover:bg-gray-200">
//           {length}
//         </span>
//       ) : null}
//       <span className="text-gray-500 group-hover:text-gray-700">
//         {isOpen ? (
//           <IoChevronUp className="h-4 w-4" />
//         ) : (
//           <IoChevronDown className="h-4 w-4" />
//         )}
//       </span>
//     </button>
//   );
// };

// export default SubTitle;

'use client';

import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import { getSubTitleLength } from '../../services/subTitleService'; // Add API call

interface SubTitleProps {
  title: string;
  length?: number;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  listId?: string; // Optional: ID to fetch data dynamically
}

const SubTitle = ({ title, length: initialLength, isOpen, setIsOpen, listId }: SubTitleProps) => {
  const [length, setLength] = useState<number | undefined>(initialLength);

  useEffect(() => {
    if (listId) {
      // Fetch length dynamically from backend if listId is provided
      getSubTitleLength(listId)
        .then((data) => setLength(data.length))
        .catch((error) => console.error('Error fetching subtitle length:', error));
    }
  }, [listId]);

  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        'group flex w-full items-center gap-2 rounded-md px-1 py-2 text-left text-sm font-semibold text-gray-700',
        'hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500',
      )}
      aria-expanded={isOpen ? 'true' : 'false'}
    >
      <span className="flex-1">{title}</span>
      {length ? (
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 group-hover:bg-gray-200">
          {length}
        </span>
      ) : null}
      <span className="text-gray-500 group-hover:text-gray-700">
        {isOpen ? (
          <IoChevronUp className="h-4 w-4" />
        ) : (
          <IoChevronDown className="h-4 w-4" />
        )}
      </span>
    </button>
  );
};

export default SubTitle;
