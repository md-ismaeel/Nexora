import { baseApi } from "@/api/base_api";
import { setUser } from "@/store/slices/auth_slice";
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
                } catch { /* surfaced by RTK Query */ }
            },
            providesTags: ["User"],
        }),

        // GET /users/:id — public profile (limited fields)
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
                } catch { /* surfaced by RTK Query */ }
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
            async onQueryStarted(body, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    // Optimistic local update — no re-fetch needed
                    dispatch(setUser({ status: body.status } as IUser));
                } catch { /* surfaced by RTK Query */ }
            },
            invalidatesTags: ["User"],
        }),

        // GET /users/search?q=&page=&limit=
        searchUsers: build.query<
            ApiResponse<{
                users: IUser[];
                pagination: { page: number; limit: number; total: number; pages: number };
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
        blockUser: build.mutation<ApiResponse<null>, string>({
            query: (userId) => ({ url: `/users/me/blocked/${userId}`, method: "POST" }),
            invalidatesTags: ["User"],
        }),

        // DELETE /users/me/blocked/:userId
        unblockUser: build.mutation<ApiResponse<null>, string>({
            query: (userId) => ({ url: `/users/me/blocked/${userId}`, method: "DELETE" }),
            invalidatesTags: ["User"],
        }),

        // DELETE /users/me — handled by auth.controller (transfers server ownership)
        deleteAccount: build.mutation<ApiResponse<null>, void>({
            query: () => ({ url: "/users/me", method: "DELETE" }),
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
    useDeleteAccountMutation,
} = userApi;