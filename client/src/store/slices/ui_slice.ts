import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// ── Modal registry ────────────────────────────────────────────────────────────

export type ModalType =
    // Server
    | "createServer"
    | "editServer"
    | "deleteServer"
    | "serverSettings"
    // Channel
    | "createChannel"
    | "editChannel"
    | "deleteChannel"
    // Invite
    | "inviteMembers"
    | "createInvite"
    // User
    | "userProfile"
    | "editProfile"
    | "deleteAccount"
    // Role
    | "createRole"
    | "editRole"
    // Message
    | "deleteMessage"
    | "pinnedMessages"
    | null;

// ── Toast notification ────────────────────────────────────────────────────────

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface Toast {
    id: string;
    message: string;
    variant: ToastVariant;
    duration?: number; // ms, default 4000
}

// ── State ─────────────────────────────────────────────────────────────────────

interface UiState {
    // Active route context
    activeServerId: string | null;
    activeChannelId: string | null;
    activeDmUserId: string | null;

    // Layout
    sidebarOpen: boolean;
    memberListOpen: boolean;

    // Modal
    activeModal: ModalType;
    modalData: Record<string, unknown> | null;

    // Toast queue
    toasts: Toast[];

    // Notification badge — total unread across all servers + DMs
    totalUnread: number;
}

const initialState: UiState = {
    activeServerId: null,
    activeChannelId: null,
    activeDmUserId: null,
    sidebarOpen: true,
    memberListOpen: true,
    activeModal: null,
    modalData: null,
    toasts: [],
    totalUnread: 0,
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {

        // ── Navigation context ──────────────────────────────────────────────────

        setActiveServer(state, action: PayloadAction<string | null>) {
            state.activeServerId = action.payload;
            state.activeChannelId = null;
            // Don't clear activeDmUserId — user might be in split-pane view
        },

        setActiveChannel(state, action: PayloadAction<string | null>) {
            state.activeChannelId = action.payload;
        },

        setActiveDmUser(state, action: PayloadAction<string | null>) {
            state.activeDmUserId = action.payload;
            state.activeServerId = null;
            state.activeChannelId = null;
        },

        // ── Layout ──────────────────────────────────────────────────────────────

        toggleSidebar(state) {
            state.sidebarOpen = !state.sidebarOpen;
        },

        setSidebar(state, action: PayloadAction<boolean>) {
            state.sidebarOpen = action.payload;
        },

        toggleMemberList(state) {
            state.memberListOpen = !state.memberListOpen;
        },

        setMemberList(state, action: PayloadAction<boolean>) {
            state.memberListOpen = action.payload;
        },

        // ── Modal ───────────────────────────────────────────────────────────────

        openModal(
            state,
            action: PayloadAction<{ modal: ModalType; data?: Record<string, unknown> }>,
        ) {
            state.activeModal = action.payload.modal;
            state.modalData = action.payload.data ?? null;
        },

        closeModal(state) {
            state.activeModal = null;
            state.modalData = null;
        },

        // ── Toasts ──────────────────────────────────────────────────────────────

        addToast(state, action: PayloadAction<Omit<Toast, "id">>) {
            const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
            state.toasts.push({ ...action.payload, id });
            // Cap queue at 5 to prevent overflow
            if (state.toasts.length > 5) state.toasts.shift();
        },

        removeToast(state, action: PayloadAction<string>) {
            state.toasts = state.toasts.filter((t) => t.id !== action.payload);
        },

        clearToasts(state) {
            state.toasts = [];
        },

        // ── Unread badge ────────────────────────────────────────────────────────

        setTotalUnread(state, action: PayloadAction<number>) {
            state.totalUnread = action.payload;
        },

        incrementTotalUnread(state) {
            state.totalUnread += 1;
        },

        decrementTotalUnread(state, action: PayloadAction<number>) {
            state.totalUnread = Math.max(0, state.totalUnread - action.payload);
        },
    },
});

export const {
    setActiveServer,
    setActiveChannel,
    setActiveDmUser,
    toggleSidebar,
    setSidebar,
    toggleMemberList,
    setMemberList,
    openModal,
    closeModal,
    addToast,
    removeToast,
    clearToasts,
    setTotalUnread,
    incrementTotalUnread,
    decrementTotalUnread,
} = uiSlice.actions;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convenience thunk — dispatch a toast from anywhere */
export const toast = (
    message: string,
    variant: ToastVariant = "info",
    duration = 4000,
) => addToast({ message, variant, duration });

export default uiSlice.reducer;