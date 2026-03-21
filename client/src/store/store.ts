import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@/api/base.api";

// Side-effect imports — registers all injectEndpoints into baseApi
import "@/api/auth.api";
import "@/api/user.api";
import "@/api/server.api";
import "@/api/channel.api";
import "@/api/message.api";
import "@/api/friend.api";
import "@/api/dm.api";

import authReducer from "@/store/slices/auth.slice";
import uiReducer from "@/store/slices/ui.slice";
import socketReducer from "@/store/slices/socket.slice";
import messageReducer from "@/store/slices/message.slice";
import dmReducer from "@/store/slices/dm.slice";
import serverReducer from "@/store/slices/server.slice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        ui: uiReducer,
        socket: socketReducer,
        message: messageReducer,
        dm: dmReducer,
        server: serverReducer,

        // Single RTK Query cache — all injected endpoints share it
        [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;