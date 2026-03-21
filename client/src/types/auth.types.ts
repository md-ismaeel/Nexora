import type { ApiResponse } from "@/types/api.types";
import type { IUser } from "@/types/user.types";

//  Request payloads
export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    username?: string;
    phoneNumber?: string;
}

export interface LoginRequest {
    email?: string;
    username?: string;
    password: string;
}

// ── Response shapes
export type AuthResponse = ApiResponse<{
    user: IUser;
    token: string;
}>;

export type AuthStatusResponse = ApiResponse<{
    isAuthenticated: boolean;
    user: IUser | null;
}>;