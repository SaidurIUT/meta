// src/services/api.ts
import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = "http://localhost:9000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const userService = {
  getAllUsers: async () => {
    const response = await api.get("/us/v1/users");
    return response.data;
  },

  getUserById: async (userId: string) => {
    const response = await api.get(`/us/v1/users/${userId}`);
    return response.data;
  },

  searchUsers: async (username: string) => {
    const response = await api.get("/us/v1/users/search", {
      params: { username },
    });
    return response.data;
  },
};
