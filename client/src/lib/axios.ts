/**
 * Axios instance — used only for multipart/form-data uploads (avatar upload)
 * that RTK Query's fetchBaseQuery can't handle natively with progress events.
 *
 * All other API calls go through RTK Query (base_api.ts).
 */
import axios from "axios";
import { store } from "@/store/store";
import { clearCredentials } from "@/store/slices/auth_slice";

const BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// ── Request interceptor — attach JWT ─────────────────────────────────────────

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — handle 401 ────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const newToken: string = data.token ?? data.data?.token;
        if (newToken) {
          localStorage.setItem("token", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch {
        store.dispatch(clearCredentials());
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;