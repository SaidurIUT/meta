// src/components/Card.tsx
"use client";

import { Draggable } from "@hello-pangea/dnd";
import Link from "next/link";
import { Card as CardType } from "@/services/cardService";

interface CardProps {
  card: CardType;
  index: number;
}

export default function Card({ card, index }: CardProps) {
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded shadow p-3 mb-2 ${
            snapshot.isDragging ? "opacity-50" : ""
          }`}
        >
          <Link href={`/boards/${card.boardId}/cards/${card.id}`}>
            <h4 className="font-medium">{card.title}</h4>
            {card.description && (
              <p className="text-sm text-gray-600 mt-1">{card.description}</p>
            )}
          </Link>
        </div>
      )}
    </Draggable>
  );
}
