import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IServer } from "@/types/server.types";

interface ServerState {
    servers: IServer[];          // user's server list (from RTK Query seeded here)
    activeServer: IServer | null;
}

const initialState: ServerState = {
    servers: [],
    activeServer: null,
};

const serverSlice = createSlice({
    name: "server",
    initialState,
    reducers: {
        setServers(state, action: PayloadAction<IServer[]>) {
            state.servers = action.payload;
        },

        setActiveServer(state, action: PayloadAction<IServer | null>) {
            state.activeServer = action.payload;
        },

        addServer(state, action: PayloadAction<IServer>) {
            const exists = state.servers.some((s) => s._id === action.payload._id);
            if (!exists) state.servers.push(action.payload);
        },

        updateServerInList(state, action: PayloadAction<Partial<IServer> & { _id: string }>) {
            const idx = state.servers.findIndex((s) => s._id === action.payload._id);
            if (idx !== -1) {
                state.servers[idx] = { ...state.servers[idx], ...action.payload };
            }
            if (state.activeServer?._id === action.payload._id) {
                state.activeServer = { ...state.activeServer, ...action.payload };
            }
        },

        removeServer(state, action: PayloadAction<string>) {
            state.servers = state.servers.filter((s) => s._id !== action.payload);
            if (state.activeServer?._id === action.payload) {
                state.activeServer = null;
            }
        },
    },
});

export const {
    setServers,
    setActiveServer,
    addServer,
    updateServerInList,
    removeServer,
} = serverSlice.actions;

export default serverSlice.reducer;