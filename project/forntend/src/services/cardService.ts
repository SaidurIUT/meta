// src/services/cardService.ts

import { privateAxios } from "./axiosConfig";

export interface Card {
  id: string;
  title: string;
  description?: string;
  order?: number;
  listId: string;
  boardId: string;
  userIds?: string[];
  labels?: string[];
  links?: string[];
  isCompleted?: boolean;
  trackedTimes?: string[];
  dateTo?: string;
  createdAt?: string;
  updatedAt?: string;
  comments?: Comment[];
  todos?: Todo[];
}

export interface Comment {
  id: string;
  text: string;
  image?: string;
  user: string;
  cardId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Todo {
  id: string;
  content: string;
  completed: boolean;
}

export interface CreateCardData {
  title: string;
  description?: string;
  listId: string;
  boardId: string;
  userIds?: string[];
  labels?: string[];
  links?: string[];
  isCompleted?: boolean;
  dateTo?: string;
}

export const cardService = {
  createCard: async (card: CreateCardData): Promise<Card> => {
    const response = await privateAxios.post("/pm/v1/cards", card);
    return response.data;
  },

  getCardById: async (cardId: string): Promise<Card> => {
    const response = await privateAxios.get(`/pm/v1/cards/${cardId}`);
    return response.data;
  },

  updateCard: async (
    cardId: string,
    updatedCard: Partial<Card>
  ): Promise<Card> => {
    const response = await privateAxios.put(
      `/pm/v1/cards/${cardId}`,
      updatedCard
    );
    return response.data;
  },

  deleteCard: async (boardId: string, cardId: string): Promise<void> => {
    await privateAxios.delete(`/pm/v1/cards/${boardId}/${cardId}`);
  },

  copyCard: async (boardId: string, cardId: string): Promise<Card> => {
    const response = await privateAxios.post(
      `/pm/v1/cards/${boardId}/copy`,
      cardId
    );
    return response.data;
  },

  getCardsByListId: async (listId: string): Promise<Card[]> => {
    const response = await privateAxios.get(`/pm/v1/cards/list/${listId}`);
    return response.data;
  },

  updateCardLabels: async (cardId: string, labels: string[]): Promise<Card> => {
    const response = await privateAxios.put(
      `/pm/v1/cards/${cardId}/labels`,
      labels
    );
    return response.data;
  },

  updateCardIsCompleted: async (
    cardId: string,
    isCompleted: boolean
  ): Promise<Card> => {
    const response = await privateAxios.put(
      `/pm/v1/cards/${cardId}/is-completed`,
      isCompleted
    );
    return response.data;
  },

  updateCardDate: async (cardId: string, dateTo: string): Promise<Card> => {
    const response = await privateAxios.put(
      `/pm/v1/cards/${cardId}/date`,
      dateTo
    );
    return response.data;
  },

  addComment: async (
    cardId: string,
    comment: Omit<Comment, "id" | "createdAt" | "updatedAt">
  ): Promise<Card> => {
    const response = await privateAxios.post(
      `/pm/v1/cards/${cardId}/comments`,
      comment
    );
    return response.data;
  },

  removeComment: async (cardId: string, commentId: string): Promise<Card> => {
    const response = await privateAxios.delete(
      `/pm/v1/cards/${cardId}/comments/${commentId}`
    );
    return response.data;
  },

  updateComments: async (
    cardId: string,
    comments: Comment[]
  ): Promise<Card> => {
    const response = await privateAxios.put(
      `/pm/v1/cards/${cardId}/comments`,
      comments
    );
    return response.data;
  },

  updateTodos: async (cardId: string, todos: Todo[]): Promise<Card> => {
    const response = await privateAxios.put(
      `/pm/v1/cards/${cardId}/todos`,
      todos
    );
    return response.data;
  },

  updateLinks: async (cardId: string, links: string[]): Promise<Card> => {
    const response = await privateAxios.put(
      `/pm/v1/cards/${cardId}/links`,
      links
    );
    return response.data;
  },

  reorderCards: async (cards: Partial<Card>[]): Promise<void> => {
    await privateAxios.put("/pm/v1/cards/reorder", cards);
  },
};
