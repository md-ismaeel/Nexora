import axios from "axios";
import { store } from "@/store/store";
import { clearCredentials } from "@/store/slices/auth.slice";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1",
  withCredentials: true, // send cookies (JWT httpOnly cookie)
  headers: {
    "Content-Type": "application/json",
  },
});

//  Request: attach Bearer token if present in store
api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(clearCredentials());
    }
    return Promise.reject(error);
  },
);
