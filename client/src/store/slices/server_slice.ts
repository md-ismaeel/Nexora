import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IServer } from "@/types/server.types";
import type { RootState } from "@/store/store";

interface ServerState {
  /** Flat list of servers the current user is a member of — seeded by server_api onQueryStarted */
  servers:        IServer[];
  /** ID only — derive the full object with selectActiveServer */
  activeServerId: string | null;
}

const initialState: ServerState = {
  servers:        [],
  activeServerId: null,
};

const serverSlice = createSlice({
  name: "server",
  initialState,
  reducers: {

    /** Seed from RTK Query result (getMyServers onQueryStarted) */
    setServers(state, action: PayloadAction<IServer[]>) {
      state.servers = action.payload;
    },

    /**
     * Track the active server by ID only.
     * Use selectActiveServer() to derive the full IServer object.
     * Keeping only the ID avoids stale object references when the server
     * list is updated via onQueryStarted in server_api.
     */
    setActiveServerId(state, action: PayloadAction<string | null>) {
      state.activeServerId = action.payload;
    },

    /** Called after POST /servers */
    addServer(state, action: PayloadAction<IServer>) {
      const exists = state.servers.some((s) => s._id === action.payload._id);
      if (!exists) state.servers.push(action.payload);
    },

    /** Partial update — called after PATCH /servers/:id */
    updateServerInList(
      state,
      action: PayloadAction<Partial<IServer> & { _id: string }>,
    ) {
      const idx = state.servers.findIndex((s) => s._id === action.payload._id);
      if (idx !== -1) {
        state.servers[idx] = { ...state.servers[idx], ...action.payload };
      }
    },

    /** Called after DELETE /servers/:id or POST /servers/:id/leave */
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

// ── Selectors ─────────────────────────────────────────────────────────────────

/** Derive the full active IServer object from the servers list */
export const selectActiveServer = (state: RootState): IServer | null =>
  state.server.servers.find((s) => s._id === state.server.activeServerId) ?? null;

/** Derive a server by ID */
export const selectServerById =
  (id: string | null | undefined) =>
  (state: RootState): IServer | null =>
    id ? (state.server.servers.find((s) => s._id === id) ?? null) : null;

export default serverSlice.reducer;