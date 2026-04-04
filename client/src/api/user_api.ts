import { baseApi } from "@/api/base_api";
import { setUser, patchUser } from "@/store/slices/auth_slice";
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
                    /* surfaced by RTK Query */
                }
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
                } catch {
                    /* surfaced by RTK Query */
                }
            },
            invalidatesTags: ["User"],
        }),

        // PATCH /users/me/password
        changePassword: build.mutation<
            ApiResponse<null>,
            { currentPassword: string; newPassword: string; confirmPassword: string }
        >({
            query: (body) => ({ url: "/users/me/password", method: "PATCH", body }),
        }),

        // PATCH /users/me/status
        // FIX: original dispatched setUser({ status } as IUser) which replaced the
        // entire user object with only a status field, wiping name, email, avatar etc.
        // Now uses patchUser for a safe partial merge — only status and customStatus
        // are updated in the store, everything else is preserved.
        updateStatus: build.mutation<
            ApiResponse<null>,
            { status: IUser["status"]; customStatus?: string }
        >({
            query: (body) => ({ url: "/users/me/status", method: "PATCH", body }),
            async onQueryStarted(body, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(
                        patchUser({
                            status: body.status,
                            ...(body.customStatus !== undefined
                                ? { customStatus: body.customStatus }
                                : {}),
                        }),
                    );
                } catch {
                    /* surfaced by RTK Query */
                }
            },
            invalidatesTags: ["User"],
        }),

        // GET /users/search?q=&page=&limit=
        searchUsers: build.query<
            ApiResponse<{
                users: IUser[];
                pagination: {
                    page: number;
                    limit: number;
                    total: number;
                    pages: number;
                    hasMore: boolean;
                };
            }>,
            { q: string; page?: number; limit?: number }
        >({
            query: ({ q, page = 1, limit = 20 }) =>
                `/users/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`,
        }),

        // GET /users/me/blocked
        getBlockedUsers: build.query<ApiResponse<IUser[]>, void>({
            query: () => "/users/me/blocked",
            providesTags: ["User"],
        }),

        // POST /users/me/blocked/:userId
        blockUser: build.mutation<ApiResponse<null>, string>({
            query: (userId) => ({
                url: `/users/me/blocked/${userId}`,
                method: "POST",
            }),
            invalidatesTags: ["User"],
        }),

        // DELETE /users/me/blocked/:userId
        unblockUser: build.mutation<ApiResponse<null>, string>({
            query: (userId) => ({
                url: `/users/me/blocked/${userId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["User"],
        }),

        // GET /users/me/servers
        getUserServers: build.query<ApiResponse<unknown[]>, void>({
            query: () => "/users/me/servers",
            providesTags: ["Server"],
        }),

        // GET /users/me/friends
        getMyFriends: build.query<ApiResponse<IUser[]>, void>({
            query: () => "/users/me/friends",
            providesTags: ["Friend"],
        }),

        // DELETE /users/me — cascades server ownership transfer in user.controller
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
    useGetUserServersQuery,
    useGetMyFriendsQuery,
    useDeleteAccountMutation,
} = userApi;