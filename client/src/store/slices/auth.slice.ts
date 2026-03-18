import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IUser } from "@/types/user.types";

interface AuthState {
    user: IUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean; // true on boot until /auth/status resolves
}

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem("token"),
    isAuthenticated: false,
    isLoading: true,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // Called after login / register / oauth
        setCredentials(state, action: PayloadAction<{ user: IUser; token: string }>) {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.isLoading = false;
            localStorage.setItem("token", action.payload.token);
        },

        // Called after profile update
        setUser(state, action: PayloadAction<IUser>) {
            state.user = action.payload;
        },

        // Called after logout / 401
        clearCredentials(state) {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            localStorage.removeItem("token");
        },

        // Used by getAuthStatus to signal check is done
        setLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload;
        },
    },
});

export const { setCredentials, setUser, clearCredentials, setLoading } = authSlice.actions;
export default authSlice.reducer;