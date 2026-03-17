import { baseApi } from "./base.api";
import type { ApiResponse } from "@/types/api.types";
import type { IUser } from "@/types/user.types";
import type { IFriendRequest } from "@/types/message.types";

export const friendApi = baseApi.injectEndpoints({
    endpoints: (build) => ({

        // GET /friends
        getFriends: build.query<ApiResponse<{ friends: IUser[] }>, void>({
            query: () => "/friends",
            providesTags: ["Friend"],
        }),

        // GET /friends/requests/pending
        getPendingRequests: build.query<
            ApiResponse<{ requests: IFriendRequest[] }>,
            void
        >({
            query: () => "/friends/requests/pending",
            providesTags: ["FriendRequest"],
        }),

        // GET /friends/requests/sent
        getSentRequests: build.query<
            ApiResponse<{ requests: IFriendRequest[] }>,
            void
        >({
            query: () => "/friends/requests/sent",
            providesTags: ["FriendRequest"],
        }),

        // GET /friends/requests
        getAllFriendRequests: build.query<
            ApiResponse<{
                received: IFriendRequest[];
                sent: IFriendRequest[];
                totalReceived: number;
                totalSent: number;
            }>,
            void
        >({
            query: () => "/friends/requests",
            providesTags: ["FriendRequest"],
        }),

        // POST /friends/requests/:userId
        sendFriendRequest: build.mutation<
            ApiResponse<{ request: IFriendRequest }>,
            string
        >({
            query: (userId) => ({
                url: `/friends/requests/${userId}`,
                method: "POST",
            }),
            invalidatesTags: ["FriendRequest"],
        }),

        // POST /friends/requests/:requestId/accept
        acceptFriendRequest: build.mutation<
            ApiResponse<{ request: IFriendRequest }>,
            string
        >({
            query: (requestId) => ({
                url: `/friends/requests/${requestId}/accept`,
                method: "POST",
            }),
            invalidatesTags: ["FriendRequest", "Friend"],
        }),

        // POST /friends/requests/:requestId/decline
        declineFriendRequest: build.mutation<ApiResponse<null>, string>({
            query: (requestId) => ({
                url: `/friends/requests/${requestId}/decline`,
                method: "POST",
            }),
            invalidatesTags: ["FriendRequest"],
        }),

        // DELETE /friends/requests/:requestId
        cancelFriendRequest: build.mutation<ApiResponse<null>, string>({
            query: (requestId) => ({
                url: `/friends/requests/${requestId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["FriendRequest"],
        }),

        // DELETE /friends/:userId
        removeFriend: build.mutation<ApiResponse<null>, string>({
            query: (userId) => ({
                url: `/friends/${userId}`,
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