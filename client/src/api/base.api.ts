import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Type-only import breaks the circular dependency (store → baseApi → store)
import type { RootState } from "@/store/store";

export const baseApi = createApi({
    reducerPath: "baseApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1",
        credentials: "include",
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: [
        "Auth",
        "User",
        "Server",
        "Channel",
        "Message",
        "Friend",
        "FriendRequest",
        "DirectMessage",
        "Invite",
        "Role",
    ],
    endpoints: () => ({}),
});