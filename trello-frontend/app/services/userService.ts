import { publicAxios } from "./axiosConfig";

// Fetch user details by email
export const getUserByEmail = async (email: string) => {
  try {
    const response = await publicAxios.get(`/api/users/email/${email}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw error;
  }
};
