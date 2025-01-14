// src/services/cardService.ts

import { publicAxios, privateAxios } from "./axiosConfig";
import { CreateCardRequest } from "../types";
import { CardDTO, CommentDTO, TodoDTO,UserDTO } from "../types"; // Define these interfaces accordingly

// Create a new card
export const createCard = async (card: CreateCardRequest): Promise<CardDTO> => {
  try {
    const response = await privateAxios.post(`/api/cards`, card);
    return response.data;
  } catch (error: any) {
    console.error("Error creating card:", error.response?.data || error.message);
    throw error;
  }
};
// Get a card by ID
export const getCardById = async (cardId: string): Promise<CardDTO> => {
  try {
    const response = await privateAxios.get(`/api/cards/${cardId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching card:", error.response?.data || error.message);
    throw error;
  }
};

// Update card
export const updateCard = async (cardId: string, updatedCard: Partial<CreateCardRequest>): Promise<CardDTO> => {
  try {
    const response = await privateAxios.put(`/api/cards/${cardId}`, updatedCard);
    return response.data;
  } catch (error: any) {
    console.error("Error updating card:", error.response?.data || error.message);
    throw error;
  }
};

// Delete a card
export const deleteCard = async (data: { cardId: string; boardId: string }): Promise<void> => {
  try {
    await privateAxios.delete(`/api/cards/${data.boardId}/${data.cardId}`);
  } catch (error: any) {
    console.error("Error deleting card:", error.response?.data || error.message);
    throw new Error("Failed to delete card");
  }
};

// Copy a card
export const copyCard = async (data: { id: string; boardId: string }): Promise<CardDTO> => {
  try {
    const response = await privateAxios.post(`/api/cards/${data.boardId}/copy`, data.id, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error copying card:", error.response?.data || error.message);
    throw new Error("Failed to copy card");
  }
};



// Get all cards for a specific board list
export const getCardsByBoardListId = async (listId: string): Promise<CardDTO[]> => {
  try {
    const response = await publicAxios.get(`/api/cards/list/${listId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching cards for board list:", error.response?.data || error.message);
    throw error;
  }
};

// Get users not assigned to a specific card
export const getNoCardMembers = async (boardId: string, cardId: string): Promise<UserDTO[]> => {
  try {
    const response = await publicAxios.get(`/api/cards/${boardId}/${cardId}/no-members`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching users not assigned to the card:", error.response?.data || error.message);
    throw new Error('Failed to fetch users not assigned to the card');
  }
};



// Add a member to a card
export const addCardMember = async (cardId: string, userId: string): Promise<CardDTO> => {
  try {
    const response = await privateAxios.put(`/api/cards/${cardId}/add-member`, { userId });
    return response.data;
  } catch (error: any) {
    console.error("Error adding card member:", error.response?.data || error.message);
    throw new Error("Failed to add card member");
  }
};

// Remove a member from a card
export const removeMemberFromCard = async (data: { userId: string; cardId: string }): Promise<CardDTO> => {
  try {
    const response = await privateAxios.put(`/api/cards/${data.cardId}/remove-member`, { userId: data.userId });
    return response.data;
  } catch (error: any) {
    console.error("Error removing card member:", error.response?.data || error.message);
    throw new Error("Failed to remove card member");
  }
};
// Update card labels
export const updateCardLabel = async (cardId: string, labels: string[]): Promise<CardDTO> => {
  try {
    const response = await privateAxios.put(`/api/cards/${cardId}/labels`, labels);
    return response.data;
  } catch (error: any) {
    console.error("Error updating card labels:", error.response?.data || error.message);
    throw new Error('Failed to update card labels');
  }
};

// Update card isCompleted
export const updateCardIsCompleted = async (cardId: string, isCompleted: boolean): Promise<CardDTO> => {
  try {
    const response = await privateAxios.put(`/api/cards/${cardId}/is-completed`, isCompleted);
    return response.data;
  } catch (error: any) {
    console.error("Error updating card completion status:", error.response?.data || error.message);
    throw new Error('Failed to update card completion status');
  }
};

// Update card comments
export const updateCardComments = async (cardId: string, comments: CommentDTO[]): Promise<CardDTO> => {
  try {
    const response = await privateAxios.put(`/api/cards/${cardId}/comments`, comments);
    return response.data;
  } catch (error: any) {
    console.error("Error updating card comments:", error.response?.data || error.message);
    throw new Error('Failed to update card comments');
  }
};

// Update card todos
export const updateCardTodos = async (cardId: string, todos: TodoDTO[]): Promise<CardDTO> => {
  try {
    const response = await privateAxios.put(`/api/cards/${cardId}/todos`, todos);
    return response.data;
  } catch (error: any) {
    console.error("Error updating card todos:", error.response?.data || error.message);
    throw new Error('Failed to update card todos');
  }
};

// Update card links
export const updateCardLinks = async (cardId: string, links: string[]): Promise<CardDTO> => {
  try {
    const response = await privateAxios.put(`/api/cards/${cardId}/links`, links);
    return response.data;
  } catch (error: any) {
    console.error("Error updating card links:", error.response?.data || error.message);
    throw new Error('Failed to update card links');
  }
};

// Update card date
export const updateCardDate = async (cardId: string, dateTo: string): Promise<CardDTO> => {
  try {
    const response = await privateAxios.put(`/api/cards/${cardId}/date`, dateTo);
    return response.data;
  } catch (error: any) {
    console.error("Error updating card date:", error.response?.data || error.message);
    throw new Error('Failed to update card date');
  }
};

// Add Todo to a Card
export const addCardTodo = async (cardId: string, todo: { content: string; completed: boolean }): Promise<CardDTO> => {
  try {
    const response = await privateAxios.post(`/api/cards/${cardId}/todos`, todo);
    return response.data;
  } catch (error: any) {
    console.error("Error adding todo:", error.response?.data || error.message);
    throw new Error('Error adding todo');
  }
};

// Change Todo Completed Status
export const changeTodoCompleted = async (
  cardId: string,
  todoId: string,
  completed: boolean
): Promise<CardDTO> => {
  try {
    const response = await privateAxios.put(`/api/cards/${cardId}/todos/${todoId}`, { completed });
    return response.data;
  } catch (error: any) {
    console.error("Error updating todo status:", error.response?.data || error.message);
    throw new Error('Error updating todo status');
  }
};

// Remove Todo from a Card
export const removeCardTodo = async (cardId: string, todoId: string): Promise<CardDTO> => {
  try {
    const response = await privateAxios.delete(`/api/cards/${cardId}/todos/${todoId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error removing todo:", error.response?.data || error.message);
    throw new Error('Error removing todo');
  }
};


export const reorderCard = async (data: { items: Partial<CardDTO>[]; boardId: string }) => {
  try {
    const response = await privateAxios.put(`/api/cards/reorder`, data.items);
    return { success: true, result: response.data };
  } catch (error: any) {
    console.error("Error reordering cards:", error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || "Failed to reorder cards" };
  }
};

export const updateCardTrackedTimes = async (data: { id: string; trackedTimes: string[] }) => {
  try {
    const response = await privateAxios.put(`/api/cards/${data.id}/tracked-times`, {
      trackedTimes: data.trackedTimes,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating tracked times:', error.response?.data || error.message);
    throw new Error('Failed to update tracked times');
  }
};



// Update card title
export const updateCardTitle = async (cardId: string, title: string): Promise<CardDTO> => {
  try {
    const response = await privateAxios.put(`/api/cards/${cardId}/title`, { title });
    return response.data;
  } catch (error: any) {
    console.error("Error updating card title:", error.response?.data || error.message);
    throw new Error('Failed to update card title');
  }
};

// Add a comment to a card
export const addCardComment = async (cardId: string, comment: CommentDTO): Promise<CardDTO> => {
  try {
    const response = await privateAxios.post(`/api/cards/${cardId}/comments`, comment);
    return response.data;
  } catch (error: any) {
    console.error("Error adding comment:", error.response?.data || error.message);
    throw new Error("Failed to add comment");
  }
};

// Remove a comment from the card
export const removeCardComment = async (cardId: string, commentId: string): Promise<CardDTO> => {
  try {
    const response = await privateAxios.delete(`/api/cards/${cardId}/comments/${commentId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error removing comment:", error.response?.data || error.message);
    throw new Error('Failed to remove comment');
  }
};

// Update card description
export const updateCardDescription = async (cardId: string, description: string): Promise<CardDTO> => {
  try {
    const response = await privateAxios.put(`/api/cards/${cardId}/description`, { description });
    return response.data;
  } catch (error: any) {
    console.error("Error updating card description:", error.response?.data || error.message);
    throw new Error('Failed to update card description');
  }
};
