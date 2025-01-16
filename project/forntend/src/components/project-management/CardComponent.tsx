// // src/components/CardComponent.tsx
// "use client";

// import Link from "next/link";
// import { Card } from "@/services/cardService";

// interface CardProps {
//   card: Card;
// }

// export default function CardComponent({ card }: CardProps) {
//   return (
//     <Link
//       href={`/boards/${card.boardId}/cards/${card.id}`}
//       className="block"
//     >
//       <h4 className="font-medium">{card.title}</h4>
//       {card.description && (
//         <p className="text-sm text-gray-600 mt-1">
//           {card.description}
//         </p>
//       )}
//     </Link>
//   );
// }

"use client";

import Link from "next/link";
import { Card } from "@/services/cardService";

interface CardProps {
  card: Card;
}

export default function CardComponent({ card }: CardProps) {
  return (
    <Link
      href={`/boards/${card.boardId}/cards/${card.id}`}
      className="block"
    >
      <h4 className="font-medium">{card.title}</h4>
      {card.description && (
        <p className="text-sm text-gray-600 mt-1">
          {card.description}
        </p>
      )}
    </Link>
  );
}

