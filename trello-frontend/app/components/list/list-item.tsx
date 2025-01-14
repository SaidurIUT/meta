

// ListItem.tsx
'use client';

import { useEffect, useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { cn } from '../../lib/utils';
import { CardDTO } from '../../types';
import { getCardsByBoardListId } from '../../services/cardService';
import CardItem from '../cards/card-item';
import CreateCard from '../cards/create-card';
import ListHeader from './list-header';
import { List } from '../../types';


interface ListProps {
  list: {
    id: string;
    title: string;
    order: number;
    boardId: string;
    board: any;
    cards: CardDTO[];
    createdAt: string;
    updatedAt: string;
  };
  index: number;
}

const ListItem = ({ list, index }: ListProps) => {
  const [cards, setCards] = useState<CardDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedCards = await getCardsByBoardListId(list.id);
        setCards(fetchedCards);
      } catch (err) {
        setError('Failed to load cards');
        console.error('Error loading cards:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCards();
  }, [list.id]);

  const handleCardUpdate = async (updatedCard: CardDTO) => {
    setCards(prevCards =>
      prevCards.map(card =>
        card.id === updatedCard.id ? updatedCard : card
      )
    );
  };

  return (
    <Draggable draggableId={list.id} index={index}>
      {provided => (
        <li
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="w-[272px] shrink-0"
        >
          <div
            {...provided.dragHandleProps}
            className="flex h-full flex-col rounded-md bg-slate-50 shadow-md"
          >
            <ListHeader list={list} index={index} />
            <Droppable droppableId={list.id} type="card">
              {provided => (
                <div className="flex flex-col">
                  <ol
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={cn(
                      'mx-1 flex flex-col gap-y-2 overflow-y-auto px-1 py-0.5',
                      cards?.length > 0 ? 'mt-2' : 'mt-0'
                    )}
                  >
                    {isLoading ? (
                      <div className="flex justify-center p-4">
                        <div className="animate-pulse text-gray-400">Loading...</div>
                      </div>
                    ) : error ? (
                      <div className="text-center text-red-500 p-4">{error}</div>
                    ) : (
                      cards.map((card: CardDTO, index: number) => (
                        <CardItem
                          key={card.id}
                          card={card}
                          index={index}
                          onCardUpdate={handleCardUpdate}
                        />
                      ))
                    )}
                    {provided.placeholder}
                  </ol>
                  <CreateCard listId={list.id} />
                </div>
              )}
            </Droppable>
          </div>
        </li>
      )}
    </Draggable>
  );
};

export default ListItem;

