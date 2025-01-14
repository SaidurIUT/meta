

'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

import { updateCardTitle } from '../../services/cardService';
import InputForm from '../atomic/input-form';
import { CardDTO } from '../../types'; // Import CardDTO

import { Button } from '../ui/button';

interface CardDetails {
  cardData: CardDTO;
  setCardData: (cardData: CardDTO) => void;
}

const CardHeader = ({ cardData, setCardData }: CardDetails) => {
  const params = useParams();
  const boardId = params.boardId as string; // Ensure boardId is string

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    const formData = new FormData(e.target as HTMLFormElement);
    const title = formData.get('title') as string;

    if (!title.trim()) {
      toast.error('Title cannot be empty');
      return;
    }

    try {
      // API call to update the card title
      const updatedCard = await updateCardTitle(cardData.id, title);
      setCardData(updatedCard); // Update card data with API response
      toast.success('Card title successfully updated');
    } catch (error: any) {
      console.error('Error updating card title:', error);
      toast.error('Card title not updated');
    }
  };

  return (
    <div className="my-6 flex w-full items-start gap-x-3">
      <div className="w-full">
        <form onSubmit={handleSubmit}>
          <InputForm
            id="title"
            name="title" // Ensure the input field has a name attribute
            defaultValue={cardData?.title}
            className="relative mb-0.5 truncate border-transparent bg-transparent px-1 text-xl font-semibold text-gray-700 focus-visible:border-input"
          />
          <Button type="submit" className="mt-2">
            Save Title
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CardHeader;
