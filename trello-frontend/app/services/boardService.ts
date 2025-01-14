import { publicAxios, privateAxios } from "./axiosConfig";

// Fetch all boards based on the user's email
export const getAllBoards = async (userEmail: string) => {
  try {
    const response = await publicAxios.get(`/api/boards`, {
      params: { userId: userEmail },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all boards:", error);
    throw error;
  }
};
// Create a board using the Java backend
export const createBoard = async (boardData: {
  title: string;
  image: string;
  userIds?: string[];
  lists?: any[];
  cards?: any[];
}) => {
  try {
    // Ensure userIds is always populated with demo users if not provided
    const payload = {
      ...boardData,
      userIds: boardData.userIds && boardData.userIds.length > 0
        ? boardData.userIds
        : ["demo.user1@example.com", "demo.user2@example.com"],
    };

    const response = await privateAxios.post('api/boards', payload);

    return response.data;
  } catch (error) {
    console.error('Error creating board:', error);
    throw error;
  }
};




// Get a board by ID
export const getBoardById = async (id: string) => {
  try {
    const response = await publicAxios.get(`/api/boards/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching board details:", error);
    throw error;
  }
};

// Delete a board by ID
export const deleteBoard = async (id: string) => {
  try {
    const response = await privateAxios.delete(`/api/boards/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting board:", error);
    throw error;
  }
};

// Get members not in a board
export const getNoBoardMembers = async (boardId: string) => {
  try {
    const response = await publicAxios.get(`/api/boards/${boardId}/no-members`);
    return response.data;
  } catch (error) {
    console.error("Error fetching non-board members:", error);
    throw error;
  }
};

// Add a member to a board
export const addMemberToBoard = async (boardId: string, email: string) => {
  try {
    const response = await privateAxios.post(`/api/boards/${boardId}/add-member`, { email });
    return response.data;
  } catch (error) {
    console.error("Error adding member to board:", error);
    throw error;
  }
};

// Get members of a board
export const getMembersOfBoard = async (boardId: string) => {
  try {
    const response = await publicAxios.get(`/api/boards/${boardId}/members`);
    return response.data;
  } catch (error) {
    console.error("Error fetching board members:", error);
    throw error;
  }
};
