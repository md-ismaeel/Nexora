import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface SocketState {
    connected: boolean;
    reconnecting: boolean;
}

const initialState: SocketState = {
    connected: false,
    reconnecting: false,
};

const socketSlice = createSlice({
    name: "socket",
    initialState,
    reducers: {
        setConnected(state, action: PayloadAction<boolean>) {
            state.connected = action.payload;
            state.reconnecting = false;
        },
        setReconnecting(state, action: PayloadAction<boolean>) {
            state.reconnecting = action.payload;
        },
    },
});

export const { setConnected, setReconnecting } = socketSlice.actions;
export default socketSlice.reducer;