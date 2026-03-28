import { baseApi } from "@/api/base_api";
import type { ApiResponse } from "@/types/api.types";
import type { IUser } from "@/types/user.types";
import type { IFriendRequest } from "@/types/message.types";

export const friendApi = baseApi.injectEndpoints({
    endpoints: (build) => ({

        // GET /users/me/friends
        getFriends: build.query<ApiResponse<{ friends: IUser[] }>, void>({
            query: () => "/users/me/friends",
            providesTags: ["Friend"],
        }),

        // GET /friend-requests/pending
        getPendingRequests: build.query<
            ApiResponse<{ requests: IFriendRequest[] }>,
            void
        >({
            query: () => "/friend-requests/pending",
            providesTags: ["FriendRequest"],
        }),

        // GET /friend-requests/sent
        getSentRequests: build.query<
            ApiResponse<{ requests: IFriendRequest[] }>,
            void
        >({
            query: () => "/friend-requests/sent",
            providesTags: ["FriendRequest"],
        }),

        // GET /friend-requests  → { received, sent, totalReceived, totalSent }
        getAllFriendRequests: build.query<
            ApiResponse<{
                received: IFriendRequest[];
                sent: IFriendRequest[];
                totalReceived: number;
                totalSent: number;
            }>,
            void
        >({
            query: () => "/friend-requests",
            providesTags: ["FriendRequest"],
        }),

        // POST /friend-requests/:userId
        // Note: requires a userId (ObjectId), NOT a username string.
        // Use useSearchUsersQuery first to resolve username → userId.
        sendFriendRequest: build.mutation<
            ApiResponse<{ request: IFriendRequest }>,
            string // userId
        >({
            query: (userId) => ({
                url: `/friend-requests/${userId}`,
                method: "POST",
            }),
            invalidatesTags: ["FriendRequest"],
        }),

        // PATCH /friend-requests/:requestId/accept
        acceptFriendRequest: build.mutation<
            ApiResponse<{ request: IFriendRequest }>,
            string
        >({
            query: (requestId) => ({
                url: `/friend-requests/${requestId}/accept`,
                method: "PATCH",
            }),
            invalidatesTags: ["FriendRequest", "Friend"],
        }),

        // PATCH /friend-requests/:requestId/decline
        declineFriendRequest: build.mutation<ApiResponse<null>, string>({
            query: (requestId) => ({
                url: `/friend-requests/${requestId}/decline`,
                method: "PATCH",
            }),
            invalidatesTags: ["FriendRequest"],
        }),

        // DELETE /friend-requests/:requestId  (cancel sent request)
        cancelFriendRequest: build.mutation<ApiResponse<null>, string>({
            query: (requestId) => ({
                url: `/friend-requests/${requestId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["FriendRequest"],
        }),

        // DELETE /users/me/friends/:userId
        removeFriend: build.mutation<ApiResponse<null>, string>({
            query: (userId) => ({
                url: `/users/me/friends/${userId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Friend"],
        }),

    }),
    overrideExisting: false,
});

export const {
    useGetFriendsQuery,
    useGetPendingRequestsQuery,
    useGetSentRequestsQuery,
    useGetAllFriendRequestsQuery,
    useSendFriendRequestMutation,
    useAcceptFriendRequestMutation,
    useDeclineFriendRequestMutation,
    useCancelFriendRequestMutation,
    useRemoveFriendMutation,
} = friendApi;