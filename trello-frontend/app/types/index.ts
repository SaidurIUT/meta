import { z } from 'zod';

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified?: string;
  image?: string;
  boardIds?: string[];
  cardIds?: string[];
};

// src/types/UserDTO.ts

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  // Add other relevant fields as needed
}


export type Board = {
  id: string;
  title: string;
  image: string;
  userIds?: string[];
  userEmails?: string[];
  Users?: User[];
  lists?: List[];
};

export type List = {
  id: string;
  title: string;
  order: number;
  boardId: string;
  board: Board;
  cards: Card[];
  createdAt: Date;
  updatedAt: Date;
};

// src/types/ListDTO.ts


export interface ListDTO {
  id: string;
  title: string;
  order: number;
  boardId: string;
  cards: CardDTO[];
}


export type Todo = {
  id: string;
  content: string;
  completed: boolean;
};

export type Card = {
  id: string;
  boardId: string;
  title: string;
  order: number;
  description: string;
  listId?: string;
  list?: List;
  userIds?: string[];
  users?: User[];
  label: string[];
  dateTo: string | Date;
  isCompleted: boolean;
  comments: Comment[];
  todos: Todo[];
  links: string[];
  trackedTimes: string[];
  createdAt: Date;
  updatedAt: Date;
};



export type Comment = {
  id: string;
  text: string;
  image: string;
  user: string;
};

// src/types/Card.ts

export interface CreateCardRequest {
  title: string;
  description?: string;
  listId: string;
  boardId: string;
  userIds?: string[];
  labels?: string[];
  links?: string[];
  isCompleted?: boolean;
  dateTo?: string; // ISO 8601 format, e.g., "2025-01-20T15:30:00Z"
}

// src/types/CommentDTO.ts

export interface CommentDTO {
  id: string;
  text: string;
  image?: string;
  userId: string; // Assuming 'user' in backend refers to user ID
  cardId: string;
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}

// src/types/TodoDTO.ts

export interface TodoDTO {
  id: string;
  content: string;
  completed: boolean;
  cardId: string;
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}



export interface CardDTO {
  id: string;
  title: string;
  description: string;
  order: number;
  listId: string;
  boardId: string;
  userIds: string[];
  labels: string[];
  links: string[];
  isCompleted: boolean;
  trackedTimes: any[]; // Update with proper type if needed
  dateTo: string | null;
  createdAt: string;
  updatedAt: string;
  comments: any[]; // Update with proper type if needed
  todos: any[];
  label: string; // Update with proper type if needed
}


export type Label = {
  id: string;
  name: string;
  color: string;
  cardId?: string;
  card: Card;
};

export interface List {
  id: string;
  title: string;
  order: number;
  boardId: string;
  board: any;
  cards: Card[];
  createdAt: string;
  updatedAt: string;
}

export type LabelData = {
  id: string;
  title: string;
  color: string;
};

export type TImage = {
  id: string;
  image: string;
  name: string;
};

export const UpdateCard = z.object({
  description: z.optional(z.string()),
  title: z.optional(z.string()),
  comments: z.optional(z.any()),
  boardId: z.string(),
  id: z.string(),
});