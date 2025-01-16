"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Card as CardType } from "@/services/cardService";
import { Clock } from 'lucide-react';
import TimeTracker from './TimeTracker';

interface CardProps {
  card: CardType;
  index: number;
  onClick: (cardId: string) => void;
}

export default function Card({ card, index, onClick }: CardProps) {
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg shadow-sm p-3 mb-2 hover:shadow-md transition-shadow duration-200 ${
            snapshot.isDragging ? "opacity-75 shadow-lg" : ""
          }`}
          onClick={() => onClick(card.id)}
        >
          <h4 className="font-medium text-gray-800 mb-2">{card.title}</h4>
          {card.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{card.description}</p>
          )}
          <div className="flex flex-wrap gap-2 mb-2">
            {card.labels && card.labels.slice(0, 2).map((label, index) => (
              <span key={index} className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                {label}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            {card.dateTo && (
              <div className="flex items-center">
                <Clock size={12} className="mr-1" />
                <span>{new Date(card.dateTo).toLocaleDateString()}</span>
              </div>
            )}
            <div className="mt-2">
              <TimeTracker cardData={card} />
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

