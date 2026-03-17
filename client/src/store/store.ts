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

import authReducer from "./slices/auth.slice";
import uiReducer from "./slices/ui.slice";
import socketReducer from "./slices/socket.slice";
import messageReducer from "./slices/message.slice";
import dmReducer from "./slices/dm.slice";
import serverReducer from "./slices/server.slice";

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