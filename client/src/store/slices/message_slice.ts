import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IMessage } from "@/types/message.types";
import type { RootState } from "@/store/store";

/**
 * Message slice — real-time layer on top of RTK Query's cache.
 *
 * RTK Query owns the initial load (getMessages query).
 * This slice owns socket-pushed updates so they appear instantly
 * without waiting for a re-fetch.
 *
 * Relationship:
 *   message_api.ts getMessages.onQueryStarted → dispatches setMessages (seed)
 *   socket handler message:created            → dispatches addMessage
 *   socket handler message:updated            → dispatches updateMessage
 *   socket handler message:deleted            → dispatches removeMessage
 *   use-typing hook                           → dispatches setTyping
 */

interface MessageState {
  /** keyed by channelId → ordered message array (oldest first) */
  byChannel:   Record<string, IMessage[]>;
  /** keyed by channelId → userIds currently typing */
  typing:      Record<string, string[]>;
  /** channelIds that have been read (for unread badge logic) */
  readChannels: Set<string> | string[]; // use array for serialisability
}

const initialState: MessageState = {
  byChannel:    {},
  typing:       {},
  readChannels: [],
};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {

    // ── Message CRUD (socket-driven) ────────────────────────────────────────

    /** Append a socket-pushed new message */
    addMessage(state, action: PayloadAction<IMessage>) {
      const channelId = action.payload.channel as string;
      if (!state.byChannel[channelId]) state.byChannel[channelId] = [];
      const exists = state.byChannel[channelId].some(
        (m) => m._id === action.payload._id,
      );
      if (!exists) state.byChannel[channelId].push(action.payload);
    },

    /** Update edited message in cache */
    updateMessage(state, action: PayloadAction<IMessage>) {
      const channelId = action.payload.channel as string;
      const list = state.byChannel[channelId];
      if (list) {
        const idx = list.findIndex((m) => m._id === action.payload._id);
        if (idx !== -1) list[idx] = action.payload;
      }
    },

    /** Remove deleted message from cache */
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

    /** Seed messages from RTK Query result */
    setMessages(
      state,
      action: PayloadAction<{ channelId: string; messages: IMessage[] }>,
    ) {
      state.byChannel[action.payload.channelId] = action.payload.messages;
    },

    /** Prepend older messages loaded via infinite scroll */
    prependMessages(
      state,
      action: PayloadAction<{ channelId: string; messages: IMessage[] }>,
    ) {
      const existing = state.byChannel[action.payload.channelId] ?? [];
      const existingIds = new Set(existing.map((m) => m._id));
      const fresh = action.payload.messages.filter(
        (m) => !existingIds.has(m._id),
      );
      state.byChannel[action.payload.channelId] = [...fresh, ...existing];
    },

    /** Toggle isPinned on a cached message */
    togglePinInCache(
      state,
      action: PayloadAction<{ messageId: string; channelId: string; isPinned: boolean }>,
    ) {
      const { messageId, channelId, isPinned } = action.payload;
      const list = state.byChannel[channelId];
      if (list) {
        const msg = list.find((m) => m._id === messageId);
        if (msg) msg.isPinned = isPinned;
      }
    },

    // ── Typing indicators ───────────────────────────────────────────────────

    setTyping(
      state,
      action: PayloadAction<{
        channelId: string;
        userId:    string;
        isTyping:  boolean;
      }>,
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

    clearAllTyping(state) {
      state.typing = {};
    },

    // ── Read tracking ───────────────────────────────────────────────────────

    markChannelRead(state, action: PayloadAction<string>) {
      if (!(state.readChannels as string[]).includes(action.payload)) {
        (state.readChannels as string[]).push(action.payload);
      }
    },

    // ── Cleanup ─────────────────────────────────────────────────────────────

    /** Call when user navigates away from a channel — frees memory */
    clearChannel(state, action: PayloadAction<string>) {
      delete state.byChannel[action.payload];
      delete state.typing[action.payload];
    },

    /** Clear everything — called on logout */
    clearAllMessages(state) {
      state.byChannel    = {};
      state.typing       = {};
      state.readChannels = [];
    },
  },
});

export const {
  addMessage,
  updateMessage,
  removeMessage,
  setMessages,
  prependMessages,
  togglePinInCache,
  setTyping,
  clearAllTyping,
  markChannelRead,
  clearChannel,
  clearAllMessages,
} = messageSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectChannelMessages =
  (channelId: string | undefined) =>
  (state: RootState): IMessage[] =>
    channelId ? (state.message.byChannel[channelId] ?? []) : [];

export const selectTypingUsers =
  (channelId: string | undefined) =>
  (state: RootState): string[] =>
    channelId ? (state.message.typing[channelId] ?? []) : [];

export default messageSlice.reducer;