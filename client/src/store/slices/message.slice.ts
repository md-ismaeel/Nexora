import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IMessage } from "@/types/message.types";

// Keyed by channelId — stores latest messages received via socket
// RTK Query handles the initial load; this slice handles real-time updates
interface MessageState {
    byChannel: Record<string, IMessage[]>;
    typing: Record<string, string[]>; // channelId → userId[]
}

const initialState: MessageState = {
    byChannel: {},
    typing: {},
};

const messageSlice = createSlice({
    name: "message",
    initialState,
    reducers: {
        // Append a new message from socket
        addMessage(state, action: PayloadAction<IMessage>) {
            const channelId = action.payload.channel as string;
            if (!state.byChannel[channelId]) {
                state.byChannel[channelId] = [];
            }
            // Avoid duplicates
            const exists = state.byChannel[channelId].some(
                (m) => m._id === action.payload._id,
            );
            if (!exists) {
                state.byChannel[channelId].push(action.payload);
            }
        },

        // Update edited message in cache
        updateMessage(state, action: PayloadAction<IMessage>) {
            const channelId = action.payload.channel as string;
            const list = state.byChannel[channelId];
            if (list) {
                const idx = list.findIndex((m) => m._id === action.payload._id);
                if (idx !== -1) list[idx] = action.payload;
            }
        },

        // Remove deleted message from cache
        removeMessage(
            state,
            action: PayloadAction<{ messageId: string; channelId: string }>,
        ) {
            const { messageId, channelId } = action.payload;
            if (state.byChannel[channelId]) {
                state.byChannel[channelId] = state.byChannel[channelId].filter(
                    (m) => m._id !== messageId,
                );
            }
        },

        // Seed messages from RTK Query result into the cache
        setMessages(
            state,
            action: PayloadAction<{ channelId: string; messages: IMessage[] }>,
        ) {
            state.byChannel[action.payload.channelId] = action.payload.messages;
        },

        // Typing indicators
        setTyping(
            state,
            action: PayloadAction<{ channelId: string; userId: string; isTyping: boolean }>,
        ) {
            const { channelId, userId, isTyping } = action.payload;
            if (!state.typing[channelId]) state.typing[channelId] = [];
            if (isTyping) {
                if (!state.typing[channelId].includes(userId)) {
                    state.typing[channelId].push(userId);
                }
            } else {
                state.typing[channelId] = state.typing[channelId].filter(
                    (id) => id !== userId,
                );
            }
        },

        clearChannel(state, action: PayloadAction<string>) {
            delete state.byChannel[action.payload];
            delete state.typing[action.payload];
        },
    },
});

export const {
    addMessage,
    updateMessage,
    removeMessage,
    setMessages,
    setTyping,
    clearChannel,
} = messageSlice.actions;

export default messageSlice.reducer;