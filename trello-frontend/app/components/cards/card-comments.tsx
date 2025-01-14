

'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FaRegTrashCan } from 'react-icons/fa6';
import Image from 'next/image';

import { toast } from 'sonner';

import { addCardComment, removeCardComment } from '../../services/cardService';
import { Comment, Card } from '../../types';

import FormSubmit from '../atomic/form-submit';
import TextAreaForm from '../atomic/text-area-form';
import { Button } from '../ui/button';

import SubTitle from './sub-title';

interface CardDetails {
  card: Card;
  setCardData: (cardData: Card) => void;
}

const CardCommentsInput = ({ card, setCardData }: CardDetails) => {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    if (!card) return;
    setComments(card.comments || []);
  }, [card]);
  const handleSubmit = useCallback(
    async (data: FormData) => {
      if (!card) return;
  
      const commentText = data.get('comment') as string;
      try {
        // Create a new comment object
        const newComment: Comment = {
          id: crypto.randomUUID(),
          text: commentText,
          image: '/logo.jpg', // Replace with user-specific data if applicable
          user: 'Anonymous', // Replace with user-specific data if applicable
        };
  
        // Optimistic UI Update
        const updatedCard = {
          ...card,
          comments: [...(card.comments || []), newComment],
        };
        setComments(updatedCard.comments);
  
        // API call to add comment
        const res = await addCardComment(Number(card.id), newComment);
        if (res.success) {
          setCardData(res.result); // Update card data with the response
          toast.success('Your comment was added to the card');
        } else {
          toast.error('Failed to add comment');
        }
  
        formRef.current?.reset();
      } catch (error) {
        console.error('Failed to add comment:', error);
        toast.error('Failed to add comment');
      }
    },
    [card, setCardData],
  );
  

  const handleRemove = useCallback(
    async (commentId: number) => {
      if (!card) return;
  
      try {
        if (confirm('Are you sure you want to delete this comment?')) {
          // Optimistic UI Update
          const updatedComments = card.comments.filter(
            (comment) => Number(comment.id) !== commentId,
          );
          setComments(updatedComments);
  
          // API call to remove comment
          const res = await removeCardComment(Number(card.id), commentId);
          if (res.success) {
            setCardData(res.result); // Update card data with the response
            setComments(res.result.comments); // Update comments in UI
            toast.success('Comment deleted');
          } else {
            toast.error('Failed to delete comment');
          }
        }
      } catch (error) {
        console.error('Failed to delete comment:', error);
        toast.error('Failed to delete comment');
      }
    },
    [card, setCardData],
  );
  

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(formRef.current!);
    handleSubmit(formData);
  };

  return (
    <div className="mb-[1rem]">
      <div>
        <SubTitle
          title="Comments"
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          length={comments.length}
        />
        <div
          className={`no-scrollbar max-h-[40vh] overflow-auto ${isOpen ? 'block' : 'hidden'}`}
        >
          <div className="my-2">
            {comments.map((comment, index) => (
              <div
                key={index}
                className="mb-2 flex flex-col items-start gap-2 rounded-md bg-input p-2"
              >
                <div className="flex w-full items-center gap-2">
                  <Image
                    src={comment.image || '/logo.jpg'}
                    className="h-7 w-7 rounded-full object-cover"
                    alt={`${comment.user}'s avatar`}
                    width={30}
                    height={30}
                  />
                  <span className="text-xs">{comment.user}</span>
                </div>
                <div className="flex w-full flex-col">
                  <p className="bg-input p-2 text-xs">{comment.text}</p>
                  <div className="flex w-full justify-end">
                    <button
                      onClick={() => handleRemove(Number(comment.id))}
                      className="text-red-500"
                      title="Delete comment"
                    >
                      <FaRegTrashCan />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {isEditable ? (
            <form
              onSubmit={handleFormSubmit}
              className="space-y-2"
              ref={formRef}
            >
              <TextAreaForm
                id="comment"
                className="mt-2 w-full"
                placeholder="Write a comment to card"
                defaultValue=""
              />
              <div className="flex items-center justify-between">
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
              className="rounded-ms min-h-20 bg-slate-100 p-3 text-sm"
              onClick={() => setIsEditable(true)}
            >
              {'Write a comment to card'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardCommentsInput;
