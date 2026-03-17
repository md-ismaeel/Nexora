import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IDirectMessage } from "@/types/message.types";

// Keyed by the OTHER user's ID
interface DmState {
    byUser: Record<string, IDirectMessage[]>;
    unreadCounts: Record<string, number>; // userId → unread count
}

const initialState: DmState = {
    byUser: {},
    unreadCounts: {},
};

const dmSlice = createSlice({
    name: "dm",
    initialState,
    reducers: {
        addDm(state, action: PayloadAction<{ userId: string; message: IDirectMessage }>) {
            const { userId, message } = action.payload;
            if (!state.byUser[userId]) state.byUser[userId] = [];
            const exists = state.byUser[userId].some((m) => m._id === message._id);
            if (!exists) state.byUser[userId].push(message);
        },

        updateDm(state, action: PayloadAction<{ userId: string; message: IDirectMessage }>) {
            const { userId, message } = action.payload;
            const list = state.byUser[userId];
            if (list) {
                const idx = list.findIndex((m) => m._id === message._id);
                if (idx !== -1) list[idx] = message;
            }
        },

        removeDm(state, action: PayloadAction<{ userId: string; messageId: string }>) {
            const { userId, messageId } = action.payload;
            if (state.byUser[userId]) {
                state.byUser[userId] = state.byUser[userId].filter(
                    (m) => m._id !== messageId,
                );
            }
        },

        setDms(state, action: PayloadAction<{ userId: string; messages: IDirectMessage[] }>) {
            state.byUser[action.payload.userId] = action.payload.messages;
        },

        incrementUnread(state, action: PayloadAction<string>) {
            state.unreadCounts[action.payload] =
                (state.unreadCounts[action.payload] ?? 0) + 1;
        },

        clearUnread(state, action: PayloadAction<string>) {
            state.unreadCounts[action.payload] = 0;
        },

        setUnreadCounts(state, action: PayloadAction<Record<string, number>>) {
            state.unreadCounts = action.payload;
        },
    },
});

export const {
    addDm,
    updateDm,
    removeDm,
    setDms,
    incrementUnread,
    clearUnread,
    setUnreadCounts,
} = dmSlice.actions;

export default dmSlice.reducer;