import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@/api/base_api";

// ── Side-effect imports ───────────────────────────────────────────────────────
// These register each injectEndpoints call into the shared baseApi instance.
// Order doesn't matter — all are registered before any component mounts.
import "@/api/auth_api";
import "@/api/user_api";
import "@/api/server_api";
import "@/api/channel_api";
import "@/api/message_api";
import "@/api/friend_api";
import "@/api/dm_api";
import "@/api/role_api"; // ← added: role CRUD, assign/remove, reorder

// ── Slice reducers ────────────────────────────────────────────────────────────
import authReducer from "@/store/slices/auth_slice";
import uiReducer from "@/store/slices/ui_slice";
import socketReducer from "@/store/slices/socket_slice";
import messageReducer from "@/store/slices/message_slice";
import dmReducer from "@/store/slices/dm_slice";
import serverReducer from "@/store/slices/server_slice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        ui: uiReducer,
        socket: socketReducer,
        message: messageReducer,
        dm: dmReducer,
        server: serverReducer,

        // Single RTK Query cache — all injected endpoints share one reducerPath
        [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            // RTK Query cache values can be large — suppress the serializable check
            // for the baseApi cache subtree only
            serializableCheck: {
                ignoredPaths: [baseApi.reducerPath],
            },
        }).concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;