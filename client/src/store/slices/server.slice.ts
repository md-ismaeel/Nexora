import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IServer } from "@/types/server.types";

interface ServerState {
    servers: IServer[]; // user's server list — seeded from RTK Query via onQueryStarted
    activeServerId: string | null; // FIX #23: store ID only, not the full object
}

const initialState: ServerState = {
    servers: [],
    // FIX #23: was `activeServer: IServer | null` but nothing ever dispatched
    // a full IServer to it — ui.slice already tracks the active server ID.
    // Keeping a parallel string ID here (instead of IServer) makes it consistent
    // with ui.slice and avoids stale object references.
    activeServerId: null,
};

const serverSlice = createSlice({
    name: "server",
    initialState,
    reducers: {
        setServers(state, action: PayloadAction<IServer[]>) {
            state.servers = action.payload;
        },

        // FIX #23: changed from PayloadAction<IServer | null> to PayloadAction<string | null>
        // The full server object was never dispatched here — only the ID is needed.
        // Use selectServerById(state, id) to derive the full object from the servers list.
        setActiveServerId(state, action: PayloadAction<string | null>) {
            state.activeServerId = action.payload;
        },

        addServer(state, action: PayloadAction<IServer>) {
            const exists = state.servers.some((s) => s._id === action.payload._id);
            if (!exists) state.servers.push(action.payload);
        },

        updateServerInList(
            state,
            action: PayloadAction<Partial<IServer> & { _id: string }>,
        ) {
            const idx = state.servers.findIndex((s) => s._id === action.payload._id);
            if (idx !== -1) {
                state.servers[idx] = { ...state.servers[idx], ...action.payload };
            }
        },

        removeServer(state, action: PayloadAction<string>) {
            state.servers = state.servers.filter((s) => s._id !== action.payload);
            if (state.activeServerId === action.payload) {
                state.activeServerId = null;
            }
        },
    },
});

export const {
    setServers,
    setActiveServerId,
    addServer,
    updateServerInList,
    removeServer,
} = serverSlice.actions;

// Derived selector — use this instead of reading activeServer object from state
export const selectActiveServer = (state: { server: ServerState }) =>
    state.server.servers.find((s) => s._id === state.server.activeServerId) ??
    null;

export default serverSlice.reducer;