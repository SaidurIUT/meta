"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { cardService, Card } from "@/services/cardService";
import { X, Clock, Tag,  } from 'lucide-react';
import TimeTracker from './TimeTracker';

interface CardDialogProps {
  cardId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CardDialog({ cardId, isOpen, onClose }: CardDialogProps) {
  const [card, setCard] = useState<Card | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newLink, setNewLink] = useState("");

  useEffect(() => {
    if (cardId && isOpen) {
      loadCardData();
    }
  }, [cardId, isOpen]);

  const loadCardData = async () => {
    try {
      const cardData = await cardService.getCardById(cardId);
      setCard(cardData);
    } catch (error) {
      console.error("Error loading card data:", error);
    }
  };

  const handleAddLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !card) return;

    try {
      const updatedLabels = [...(card.labels || []), newLabel];
      const updatedCard = await cardService.updateCardLabels(card.id, updatedLabels);
      setCard(updatedCard);
      setNewLabel("");
    } catch (error) {
      console.error("Error adding label:", error);
    }
  };

  const handleRemoveLabel = async (label: string) => {
    if (!card) return;

    try {
      const updatedLabels = card.labels?.filter((l) => l !== label) || [];
      const updatedCard = await cardService.updateCardLabels(card.id, updatedLabels);
      setCard(updatedCard);
    } catch (error) {
      console.error("Error removing label:", error);
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLink.trim() || !card) return;

    try {
      const updatedLinks = [...(card.links || []), newLink];
      const updatedCard = await cardService.updateLinks(card.id, updatedLinks);
      setCard(updatedCard);
      setNewLink("");
    } catch (error) {
      console.error("Error adding link:", error);
    }
  };

  const handleRemoveLink = async (link: string) => {
    if (!card) return;

    try {
      const updatedLinks = card.links?.filter((l) => l !== link) || [];
      const updatedCard = await cardService.updateLinks(card.id, updatedLinks);
      setCard(updatedCard);
    } catch (error) {
      console.error("Error removing link:", error);
    }
  };

  const handleToggleCompletion = async () => {
    if (!card) return;

    try {
      const updatedCard = await cardService.updateCardIsCompleted(card.id, !card.isCompleted);
      setCard(updatedCard);
    } catch (error) {
      console.error("Error toggling completion status:", error);
    }
  };

  if (!isOpen || !card) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl bg-white rounded-lg shadow-xl">
          <div className="flex justify-between items-start p-4 border-b">
            <Dialog.Title className="text-lg font-semibold text-gray-900">{card.title}</Dialog.Title>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X size={20} />
            </button>
          </div>

          <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-sm text-gray-600">{card.description || "No description provided."}</p>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Labels</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {card.labels && card.labels.map((label, index) => (
                  <span key={index} className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 flex items-center">
                    {label}
                    <button onClick={() => handleRemoveLabel(label)} className="ml-1 text-blue-500 hover:text-blue-700">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <form onSubmit={handleAddLabel} className="flex gap-2">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Add new label"
                  className="flex-grow border rounded-md p-1 text-sm"
                />
                <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded-md text-sm">Add</button>
              </form>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Links</h3>
              <ul className="space-y-1 mb-2">
                {card.links && card.links.map((link, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">{link}</a>
                    <button onClick={() => handleRemoveLink(link)} className="text-red-500 hover:text-red-700">
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
              <form onSubmit={handleAddLink} className="flex gap-2">
                <input
                  type="url"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  placeholder="Add new link"
                  className="flex-grow border rounded-md p-1 text-sm"
                />
                <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded-md text-sm">Add</button>
              </form>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Time Tracker</h3>
              <TimeTracker cardData={card} />
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              {card.dateTo && (
                <div className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  <span>{new Date(card.dateTo).toLocaleDateString()}</span>
                </div>
              )}
              <button
                onClick={handleToggleCompletion}
                className={`flex items-center ${card.isCompleted ? 'text-green-500' : 'text-gray-500'}`}
              >
                <Tag size={16} className="mr-1" />
                <span>{card.isCompleted ? 'Completed' : 'Mark as complete'}</span>
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

