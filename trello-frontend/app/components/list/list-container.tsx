

'use client';

import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { reorderCard } from '../../services/cardService';
import { reorderLists } from '../../services/boardListService';
import CreateList from './create-list';
import ListItem from './list-item';

interface ListProps {
  boardId: string;
  list: any[];
}

function reOrderData<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

const ListContainer = ({ boardId, list }: ListProps) => {
  const [listData, setListData] = useState(list);

  useEffect(() => {
    setListData(list);
  }, [list]);

  const onDragEnd = async (result: any) => {
    const { destination, source, type } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    try {
      if (type === 'list') {
        const data = reOrderData(listData, source.index, destination.index).map(
          (item: any, index: number) => ({ ...item, order: index }),
        );
        setListData(data);
        await reorderLists({ boardId, items: data });
      }

      if (type === 'card') {
        const newListData = [...listData];
        const sourceList = newListData.find(
          list => list.id === source.droppableId
        );
        const destList = newListData.find(
          list => list.id === destination.droppableId
        );

        if (!sourceList || !destList) {
          console.error('Source or destination list not found');
          return;
        }

        if (!sourceList.cards || !destList.cards) {
          sourceList.cards = [];
          destList.cards = [];
        }

        if (source.droppableId === destination.droppableId) {
          const reorderedCards = reOrderData(
            sourceList.cards,
            source.index,
            destination.index,
          );
          reorderedCards.forEach((card: any, idx: number) => {
            card.order = idx;
          });
          sourceList.cards = reorderedCards;
          setListData(newListData);

          await reorderCard({
            boardId,
            items: reorderedCards.map((card: any) => ({
              id: card.id,
              order: card.order,
              listId: card.listId,
            })),
          });
        } else {
          const [movedCard] = sourceList.cards.splice(source.index, 1);
          movedCard.listId = destination.droppableId;
          destList.cards.splice(destination.index, 0, movedCard);
          
          sourceList.cards.forEach((card: any, idx: number) => {
            card.order = idx;
          });
          destList.cards.forEach((card: any, idx: number) => {
            card.order = idx;
          });
          
          setListData(newListData);

          await reorderCard({
            boardId,
            items: [
              ...sourceList.cards.map((card: any) => ({
                id: card.id,
                order: card.order,
                listId: card.listId,
              })),
              ...destList.cards.map((card: any) => ({
                id: card.id,
                order: card.order,
                listId: card.listId,
              })),
            ],
          });
        }
      }
    } catch (error) {
      console.error('Error during drag and drop:', error);
      setListData(list); // Revert to original state on error
    }
  };

  return (
    <div className="h-full overflow-x-auto">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="lists" type="list" direction="horizontal">
          {provided => (
            <ol
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex gap-x-3 p-4"
            >
              {listData?.map((list: any, index: number) => (
                <ListItem key={list.id} list={list} index={index} />
              ))}
              {provided.placeholder}
              <CreateList boardId={boardId} />
            </ol>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default ListContainer;
