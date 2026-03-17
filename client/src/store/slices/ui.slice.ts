import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ModalType =
    | "createServer"
    | "createChannel"
    | "deleteServer"
    | "deleteChannel"
    | "inviteMembers"
    | "serverSettings"
    | "userProfile"
    | null;

interface UiState {
    // Navigation
    activeServerId: string | null;
    activeChannelId: string | null;
    activeDmUserId: string | null;

    // Layout toggles
    sidebarOpen: boolean;
    memberListOpen: boolean;

    // Modal
    activeModal: ModalType;
    modalData: Record<string, unknown> | null;
}

const initialState: UiState = {
    activeServerId: null,
    activeChannelId: null,
    activeDmUserId: null,
    sidebarOpen: true,
    memberListOpen: true,
    activeModal: null,
    modalData: null,
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        setActiveServer(state, action: PayloadAction<string | null>) {
            state.activeServerId = action.payload;
            state.activeChannelId = null;
            state.activeDmUserId = null;
        },
        setActiveChannel(state, action: PayloadAction<string | null>) {
            state.activeChannelId = action.payload;
        },
        setActiveDmUser(state, action: PayloadAction<string | null>) {
            state.activeDmUserId = action.payload;
            state.activeServerId = null;
            state.activeChannelId = null;
        },
        toggleSidebar(state) {
            state.sidebarOpen = !state.sidebarOpen;
        },
        toggleMemberList(state) {
            state.memberListOpen = !state.memberListOpen;
        },
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
    },
});

export const {
    setActiveServer,
    setActiveChannel,
    setActiveDmUser,
    toggleSidebar,
    toggleMemberList,
    openModal,
    closeModal,
} = uiSlice.actions;

export default uiSlice.reducer;