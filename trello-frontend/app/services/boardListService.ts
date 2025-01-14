import { publicAxios, privateAxios } from "./axiosConfig";

interface CreateListParams {
  title: string;
  boardId: string;
}
// Fetch lists for a board
export const getLists = async (boardId: string) => {
  try {
    const response = await publicAxios.get(`/api/lists/board/${boardId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching board lists:", error);
    throw error;
  }
};

export const createList = async ({ title, boardId }: { title: string; boardId: string }) => {
  try {
    const response = await privateAxios.post('api/lists', {
      title,
      boardId,
    });

    return { success: true, data: response.data }; // Return success and the created list data
  } catch (error) {
    console.error('Error creating a board list:', error);
    const errorMessage = (error as any).response?.data?.message || 'Failed to create list';
    return { success: false, error: errorMessage };
  }
};


interface UpdateListParams {
  id: string;
  boardId: string;
  title: string;
}

export const updateList = async ({ id, boardId, title }: UpdateListParams) => {
  try {
    const response = await privateAxios.put(`/api/lists/${id}`, {
      boardId,
      title,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating list:', error);
    throw error;
  }
};

// Delete a list by ID
export const deleteList = async (id:string) => {
  try {
    const response = await privateAxios.delete(`/api/lists/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting a board list:", error);
    throw error;
  }
};



// Copy an existing list
export const copyList = async (listId: string) => {
  try {
    const response = await privateAxios.post(`/api/lists/${listId}/copy`);
    return response.data;
  } catch (error) {
    console.error("Error copying a board list:", error);
    throw error;
  }
};

// Get a specific list by ID
export const getBoardListById = async (id: string) => {
  try {
    const response = await publicAxios.get(`/api/lists/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching board list by ID:", error);
    throw error;
  }
};

export const reorderLists = async ({ boardId, items }: { boardId: string; items: any[] }) => {
  try {
    await privateAxios.put(`/api/lists/reorder`, items);
    return { success: true };
  } catch (error) {
    console.error('Error reordering lists:', error);
    throw error;
  }
};