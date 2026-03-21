import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IUser } from "@/types/user.types";

interface AuthState {
    user: IUser | null;
    token: string | null;
    isAuthenticated: boolean;
    // true on boot until /auth/status resolves — auth guards MUST check this
    // before reading isAuthenticated to prevent false redirects for logged-in users
    isLoading: boolean;
}

// FIX #22: if a token exists in localStorage we optimistically set
// isAuthenticated: true so that auth guards don't redirect before
// getAuthStatus resolves. getAuthStatus will correct it to false + clear
// credentials if the token is actually expired or invalid.
const storedToken = localStorage.getItem("token");

const initialState: AuthState = {
    user: null,
    token: storedToken,
    // Optimistically treat a stored token as authenticated — getAuthStatus
    // will validate it and call clearCredentials() if it has expired
    isAuthenticated: !!storedToken,
    isLoading: true,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // Called after login / register / oauth
        setCredentials(
            state,
            action: PayloadAction<{ user: IUser; token: string }>,
        ) {
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

        // Called after logout / 401 / failed auth status check
        clearCredentials(state) {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            localStorage.removeItem("token");
        },

        // Used by getAuthStatus to signal the boot check is complete
        setLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload;
        },
    },
});

export const { setCredentials, setUser, clearCredentials, setLoading } =
    authSlice.actions;
export default authSlice.reducer;