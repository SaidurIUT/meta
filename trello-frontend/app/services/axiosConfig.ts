// src/services/axiosConfig.ts
import axios from "axios";

const API_BASE_URL = "http://localhost:9087";

// Public Axios instance
export const publicAxios = axios.create({
  baseURL: API_BASE_URL,
});

// Private Axios instance with token interceptor
export const privateAxios = axios.create({
  baseURL: API_BASE_URL,
});


