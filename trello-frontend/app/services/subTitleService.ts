import { publicAxios } from './axiosConfig';

export const getSubTitleLength = async (listId: string) => {
  try {
    const response = await publicAxios.get(`/api/lists/${listId}/length`);
    return response.data;
  } catch (error) {
    console.error('Error fetching subtitle length:', error);
    throw error;
  }
};
