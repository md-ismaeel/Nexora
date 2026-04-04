import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";

interface SocketState {
    connected: boolean;
    reconnecting: boolean;
    socketId: string | null;
    error: string | null;
    lastConnectedAt: number | null; // unix ms
}

const initialState: SocketState = {
    connected: false,
    reconnecting: false,
    socketId: null,
    error: null,
    lastConnectedAt: null,
};

const socketSlice = createSlice({
    name: "socket",
    initialState,
    reducers: {

        setConnected(
            state,
            action: PayloadAction<{ socketId: string }>,
        ) {
            state.connected = true;
            state.reconnecting = false;
            state.socketId = action.payload.socketId;
            state.error = null;
            state.lastConnectedAt = Date.now();
        },

        setDisconnected(state) {
            state.connected = false;
            state.reconnecting = false;
            state.socketId = null;
        },

        setReconnecting(state, action: PayloadAction<boolean>) {
            state.reconnecting = action.payload;
            if (action.payload) state.connected = false;
        },

        setSocketError(state, action: PayloadAction<string>) {
            state.error = action.payload;
            state.connected = false;
            state.reconnecting = false;
        },
    },
});

export const {
    setConnected,
    setDisconnected,
    setReconnecting,
    setSocketError,
} = socketSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectSocketConnected = (state: RootState) =>
    state.socket.connected;

export const selectSocketReconnecting = (state: RootState) =>
    state.socket.reconnecting;

export default socketSlice.reducer;