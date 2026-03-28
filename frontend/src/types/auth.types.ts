import type { ApiResponse } from "@/types/api.types";
import type { IUser } from "@/types/user.types";

// ── Requests ──────────────────────────────────────────────────────────────────

export interface RegisterRequest {
  name:         string;
  email:        string;
  password:     string;
  username?:    string;
  phoneNumber?: string;
}

export interface LoginRequest {
  email?:    string;
  username?: string;
  password:  string;
}

// ── Responses ─────────────────────────────────────────────────────────────────

export type AuthResponse = ApiResponse<{
  user:  IUser;
  token: string;
}>;

export type AuthStatusResponse = ApiResponse<{
  isAuthenticated: boolean;
  user:            IUser | null;
}>;