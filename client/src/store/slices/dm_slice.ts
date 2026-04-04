import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IDirectMessage } from "@/types/message.types";
import type { RootState } from "@/store/store";

/**
 * DM slice — mirrors message_slice but keyed by the OTHER user's ID.
 *
 * dm_api.ts getDmHistory.onQueryStarted → dispatches setDms (seed)
 * socket handler dm:received             → dispatches addDm + incrementUnread
 * socket handler dm:updated              → dispatches updateDm
 * socket handler dm:deleted              → dispatches removeDm
 * socket handler dm:read                 → dispatches clearUnread
 */

interface Conversation {
    userId: string;
    lastMessage: IDirectMessage | null;
    unreadCount: number;
}

interface DmState {
    /** keyed by other userId → ordered messages (oldest first) */
    byUser: Record<string, IDirectMessage[]>;
    /** keyed by other userId → unread message count */
    unreadCounts: Record<string, number>;
    /** flat conversation list for the DM sidebar, sorted by recency */
    conversations: Conversation[];
}

const initialState: DmState = {
    byUser: {},
    unreadCounts: {},
    conversations: [],
};

const dmSlice = createSlice({
    name: "dm",
    initialState,
    reducers: {

        // ── Message CRUD (socket-driven) ────────────────────────────────────────

        /** Append a new DM received via socket */
        addDm(
            state,
            action: PayloadAction<{ userId: string; message: IDirectMessage }>,
        ) {
            const { userId, message } = action.payload;
            if (!state.byUser[userId]) state.byUser[userId] = [];
            const exists = state.byUser[userId].some((m) => m._id === message._id);
            if (!exists) state.byUser[userId].push(message);
        },

        /** Update edited DM in cache */
        updateDm(
            state,
            action: PayloadAction<{ userId: string; message: IDirectMessage }>,
        ) {
            const { userId, message } = action.payload;
            const list = state.byUser[userId];
            if (list) {
                const idx = list.findIndex((m) => m._id === message._id);
                if (idx !== -1) list[idx] = message;
            }
        },

        /** Remove deleted DM from cache */
        removeDm(
            state,
            action: PayloadAction<{ userId: string; messageId: string }>,
        ) {
            const { userId, messageId } = action.payload;
            if (state.byUser[userId]) {
                state.byUser[userId] = state.byUser[userId].filter(
                    (m) => m._id !== messageId,
                );
            }
        },

        /** Seed messages from RTK Query result (getDmHistory onQueryStarted) */
        setDms(
            state,
            action: PayloadAction<{ userId: string; messages: IDirectMessage[] }>,
        ) {
            state.byUser[action.payload.userId] = action.payload.messages;
        },

        /** Prepend older messages from infinite scroll */
        prependDms(
            state,
            action: PayloadAction<{ userId: string; messages: IDirectMessage[] }>,
        ) {
            const existing = state.byUser[action.payload.userId] ?? [];
            const existingIds = new Set(existing.map((m) => m._id));
            const fresh = action.payload.messages.filter(
                (m) => !existingIds.has(m._id),
            );
            state.byUser[action.payload.userId] = [...fresh, ...existing];
        },

        // ── Conversation list ───────────────────────────────────────────────────

        /** Seed conversation list from GET /direct-messages onQueryStarted */
        setConversations(state, action: PayloadAction<Conversation[]>) {
            state.conversations = action.payload;
        },

        /** Update the last message and sort the conversation to top */
        bumpConversation(
            state,
            action: PayloadAction<{ userId: string; lastMessage: IDirectMessage }>,
        ) {
            const { userId, lastMessage } = action.payload;
            const idx = state.conversations.findIndex((c) => c.userId === userId);
            if (idx !== -1) {
                state.conversations[idx].lastMessage = lastMessage;
                // Move to top
                const [conv] = state.conversations.splice(idx, 1);
                state.conversations.unshift(conv);
            } else {
                state.conversations.unshift({
                    userId,
                    lastMessage,
                    unreadCount: 0,
                });
            }
        },

        // ── Unread counts ───────────────────────────────────────────────────────

        /** Increment unread for a specific conversation */
        incrementUnread(state, action: PayloadAction<string>) {
            state.unreadCounts[action.payload] =
                (state.unreadCounts[action.payload] ?? 0) + 1;
            // Also sync into conversations array
            const conv = state.conversations.find(
                (c) => c.userId === action.payload,
            );
            if (conv) conv.unreadCount = (conv.unreadCount ?? 0) + 1;
        },

        /** Zero out unread for a specific conversation (mark as read) */
        clearUnread(state, action: PayloadAction<string>) {
            state.unreadCounts[action.payload] = 0;
            const conv = state.conversations.find(
                (c) => c.userId === action.payload,
            );
            if (conv) conv.unreadCount = 0;
        },

        /** Seed all unread counts from GET /direct-messages/unread/count */
        setUnreadCounts(state, action: PayloadAction<Record<string, number>>) {
            state.unreadCounts = action.payload;
        },

        // ── Cleanup ─────────────────────────────────────────────────────────────

        /** Clear a single conversation's message cache */
        clearConversation(state, action: PayloadAction<string>) {
            delete state.byUser[action.payload];
        },

        /** Called on logout — wipe everything */
        clearAllDms(state) {
            state.byUser = {};
            state.unreadCounts = {};
            state.conversations = [];
        },
    },
});

export const {
    addDm,
    updateDm,
    removeDm,
    setDms,
    prependDms,
    setConversations,
    bumpConversation,
    incrementUnread,
    clearUnread,
    setUnreadCounts,
    clearConversation,
    clearAllDms,
} = dmSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectDmMessages =
    (userId: string | undefined) =>
        (state: RootState): IDirectMessage[] =>
            userId ? (state.dm.byUser[userId] ?? []) : [];

export const selectTotalUnread = (state: RootState): number =>
    Object.values(state.dm.unreadCounts).reduce((acc, n) => acc + n, 0);

export const selectUnreadForUser =
    (userId: string | undefined) =>
        (state: RootState): number =>
            userId ? (state.dm.unreadCounts[userId] ?? 0) : 0;

export default dmSlice.reducer;