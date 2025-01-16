// // src/services/axiosConfig.ts
// import axios from "axios";

// import Cookies from "js-cookie";

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// // Public Axios instance
// export const publicAxios = axios.create({
//   baseURL: API_BASE_URL,
// });

// // Private Axios instance with token interceptor
// export const privateAxios = axios.create({
//   baseURL: API_BASE_URL,
// });

// // Attach interceptor to add the Authorization header to private requests
// privateAxios.interceptors.request.use((config) => {
//   const token = Cookies.get("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

import axios from "axios";
import Cookies from "js-cookie";
import { keycloak, updateToken } from "./keycloak";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Public Axios instance
export const publicAxios = axios.create({
  baseURL: API_BASE_URL,
});

// Private Axios instance with token interceptor
export const privateAxios = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor
privateAxios.interceptors.request.use(
  async (config) => {
    const token = Cookies.get("token");
    if (token) {
      try {
        // Update token if it's about to expire
        await updateToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        // Token refresh failed, redirect to login
        keycloak.login();
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
privateAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      Cookies.remove("token");
      keycloak.login();
    }
    return Promise.reject(error);
  }
);
