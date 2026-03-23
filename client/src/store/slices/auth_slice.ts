import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IUser } from "@/types/user.types";

interface AuthState {
    user: IUser | null;
    token: string | null;
    isAuthenticated: boolean;
    /** true on boot until /auth/status resolves — ALWAYS check this before isAuthenticated */
    isLoading: boolean;
}

const storedToken = localStorage.getItem("token");

const initialState: AuthState = {
    user: null,
    token: storedToken,
    // Optimistic: if a token exists treat user as authenticated so protected
    // routes don't flash a redirect before getAuthStatus returns.
    // getAuthStatus will call clearCredentials() if the token is expired.
    isAuthenticated: !!storedToken,
    isLoading: true,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        /** Called after login / register / oauth / getAuthStatus (success) */
        setCredentials(
            state,
            action: PayloadAction<{ user: IUser; token: string }>,
        ) {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.isLoading = false;
            if (action.payload.token) {
                localStorage.setItem("token", action.payload.token);
            }
        },

        /** Called after profile / status / avatar updates (user data only) */
        setUser(state, action: PayloadAction<IUser>) {
            state.user = action.payload;
        },

        /** Patch individual user fields without a full replace */
        patchUser(state, action: PayloadAction<Partial<IUser>>) {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },

        /** Called after logout / 401 / failed auth check */
        clearCredentials(state) {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            localStorage.removeItem("token");
        },

        /** Used by getAuthStatus.onQueryStarted finally block */
        setLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload;
        },
    },
});

export const {
    setCredentials,
    setUser,
    patchUser,
    clearCredentials,
    setLoading,
} = authSlice.actions;

export default authSlice.reducer;