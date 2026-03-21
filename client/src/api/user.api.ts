import { baseApi } from "@/api/base.api";
import { setUser } from "@/store/slices/auth.slice";
import type { ApiResponse } from "@/types/api.types";
import type { IUser } from "@/types/user.types";

export const userApi = baseApi.injectEndpoints({
    endpoints: (build) => ({

        // GET /users/me
        getMe: build.query<ApiResponse<{ user: IUser }>, void>({
            query: () => "/users/me",
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setUser(data.data.user));
                } catch {
                    /* errors surfaced by RTK Query */
                }
            },
            providesTags: ["User"],
        }),

        // GET /users/:id  — public profile (limited fields)
        getUserById: build.query<ApiResponse<{ user: IUser }>, string>({
            query: (id) => `/users/${id}`,
            providesTags: (_r, _e, id) => [{ type: "User", id }],
        }),

        // PATCH /users/me
        updateProfile: build.mutation<
            ApiResponse<{ user: IUser }>,
            Partial<Pick<IUser, "name" | "username" | "bio" | "customStatus">>
        >({
            query: (body) => ({ url: "/users/me", method: "PATCH", body }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setUser(data.data.user));
                } catch {
                    /* errors surfaced by RTK Query */
                }
            },
            invalidatesTags: ["User"],
        }),

        // PATCH /users/me/password
        changePassword: build.mutation<
            ApiResponse<null>,
            { currentPassword: string; newPassword: string }
        >({
            query: (body) => ({ url: "/users/me/password", method: "PATCH", body }),
        }),

        // PATCH /users/me/status
        updateStatus: build.mutation<
            ApiResponse<null>,
            { status: IUser["status"]; customStatus?: string }
        >({
            query: (body) => ({ url: "/users/me/status", method: "PATCH", body }),
            invalidatesTags: ["User"],
        }),

        // GET /users/search?q=
        searchUsers: build.query<
            ApiResponse<{
                users: IUser[];
                pagination: {
                    page: number;
                    limit: number;
                    total: number;
                    pages: number;
                };
            }>,
            { q: string; page?: number; limit?: number }
        >({
            query: ({ q, page = 1, limit = 20 }) =>
                `/users/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`,
        }),

        // GET /users/me/blocked
        getBlockedUsers: build.query<ApiResponse<{ users: IUser[] }>, void>({
            query: () => "/users/me/blocked",
            providesTags: ["User"],
        }),

        // POST /users/me/blocked/:userId
        // FIX #17: was "/users/me/block/${userId}" — route uses "blocked" (plural)
        blockUser: build.mutation<ApiResponse<null>, string>({
            query: (userId) => ({
                url: `/users/me/blocked/${userId}`,
                method: "POST",
            }),
            invalidatesTags: ["User"],
        }),

        // DELETE /users/me/blocked/:userId
        // FIX #17: was "/users/me/block/${userId}" — route uses "blocked" (plural)
        unblockUser: build.mutation<ApiResponse<null>, string>({
            query: (userId) => ({
                url: `/users/me/blocked/${userId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["User"],
        }),

    }),
    overrideExisting: false,
});

export const {
    useGetMeQuery,
    useGetUserByIdQuery,
    useUpdateProfileMutation,
    useChangePasswordMutation,
    useUpdateStatusMutation,
    useSearchUsersQuery,
    useGetBlockedUsersQuery,
    useBlockUserMutation,
    useUnblockUserMutation,
} = userApi;

// REMOVED: deleteAvatar  — no DELETE /users/me/avatar route on the backend.
//          Avatar upload lives at POST /users/me/avatar (multipart via Multer).
//          Implement the backend route before adding this mutation.
//
// REMOVED: updatePreferences — no PATCH /users/me/preferences route on the backend.
//          Implement the backend route + controller handler first.
//
// REMOVED: getFriends     — lives in friend.api  (GET /users/me/friends)
// REMOVED: getUserServers — lives in server.api  (GET /servers)