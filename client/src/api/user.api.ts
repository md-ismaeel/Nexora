import { baseApi } from "./base.api";
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
                } catch (error) {
                    console.log("error", error)
                }
            },
            providesTags: ["User"],
        }),

        // GET /users/:id
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
                } catch (error) {
                    console.log("error", error)
                }
            },
            invalidatesTags: ["User"],
        }),

        // DELETE /users/me/avatar
        deleteAvatar: build.mutation<ApiResponse<null>, void>({
            query: () => ({ url: "/users/me/avatar", method: "DELETE" }),
            invalidatesTags: ["User"],
        }),

        // PATCH /users/me/status
        updateStatus: build.mutation<ApiResponse<null>, { status: IUser["status"] }>(
            {
                query: (body) => ({ url: "/users/me/status", method: "PATCH", body }),
                invalidatesTags: ["User"],
            },
        ),

        // PATCH /users/me/preferences
        updatePreferences: build.mutation<
            ApiResponse<null>,
            Partial<IUser["preferences"]>
        >({
            query: (body) => ({
                url: "/users/me/preferences",
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["User"],
        }),

        // POST /users/me/block/:userId
        blockUser: build.mutation<ApiResponse<null>, string>({
            query: (userId) => ({
                url: `/users/me/block/${userId}`,
                method: "POST",
            }),
            invalidatesTags: ["User"],
        }),

        // DELETE /users/me/block/:userId
        unblockUser: build.mutation<ApiResponse<null>, string>({
            query: (userId) => ({
                url: `/users/me/block/${userId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["User"],
        }),

        // GET /users/search?q=
        searchUsers: build.query<ApiResponse<{ users: IUser[] }>, string>({
            query: (q) => `/users/search?q=${encodeURIComponent(q)}`,
        }),

    }),
    overrideExisting: false,
});

export const {
    useGetMeQuery,
    useGetUserByIdQuery,
    useUpdateProfileMutation,
    useDeleteAvatarMutation,
    useUpdateStatusMutation,
    useUpdatePreferencesMutation,
    useBlockUserMutation,
    useUnblockUserMutation,
    useSearchUsersQuery,
} = userApi;