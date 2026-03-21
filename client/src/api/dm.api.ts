import { baseApi } from "@/api/base.api";
import { setDms, setUnreadCounts } from "@/store/slices/dm.slice";
import type { ApiResponse, PaginationParams } from "@/types/api.types";
import type { IDirectMessage } from "@/types/message.types";

//  Response shapes matching the backend exactly
interface ConversationResponse {
    messages: IDirectMessage[];
    otherUser: {
        _id: string;
        username: string;
        avatar?: string;
        status: string;
        customStatus?: string;
    };
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
        hasMore: boolean;
    };
}

// FIX #8: backend returns { total, byConversation } not { counts: Record }
interface UnreadCountResponse {
    total: number;
    byConversation: Array<{ _id: string; count: number }>;
}

export const dmApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        // GET /direct-messages/:userId  (paginated)
        // FIX #6: was "/dm/${userId}" — router mounted at /direct-messages
        // FIX #9: backend returns data.data.messages not data.data.items
        getDmHistory: build.query<
            ApiResponse<ConversationResponse>,
            { userId: string } & PaginationParams
        >({
            query: ({ userId, page = 1, limit = 50 }) =>
                `/direct-messages/${userId}?page=${page}&limit=${limit}`,
            async onQueryStarted({ userId }, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // FIX #9: was data.data.items — backend key is "messages"
                    dispatch(setDms({ userId, messages: data.data.messages }));
                } catch {
                    /* errors surfaced by RTK Query */
                }
            },
            providesTags: (_r, _e, { userId }) => [
                { type: "DirectMessage", id: userId },
            ],
        }),

        // POST /direct-messages/:recipientId
        // FIX #6: was "/dm/${receiverId}"
        sendDm: build.mutation<
            ApiResponse<{ message: IDirectMessage }>,
            { receiverId: string; content: string }
        >({
            query: ({ receiverId, content }) => ({
                url: `/direct-messages/${receiverId}`,
                method: "POST",
                body: { content },
            }),
            invalidatesTags: (_r, _e, { receiverId }) => [
                { type: "DirectMessage", id: receiverId },
            ],
        }),

        // PATCH /direct-messages/message/:messageId
        // FIX #6: was "/dm/messages/${messageId}" — route is /message (singular)
        editDm: build.mutation<
            ApiResponse<{ message: IDirectMessage }>,
            { messageId: string; content: string }
        >({
            query: ({ messageId, content }) => ({
                url: `/direct-messages/message/${messageId}`,
                method: "PATCH",
                body: { content },
            }),
            invalidatesTags: ["DirectMessage"],
        }),

        // DELETE /direct-messages/message/:messageId
        // FIX #6: was "/dm/messages/${messageId}" — route is /message (singular)
        deleteDm: build.mutation<ApiResponse<null>, string>({
            query: (messageId) => ({
                url: `/direct-messages/message/${messageId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["DirectMessage"],
        }),

        // PATCH /direct-messages/:userId/read
        // FIX #6: was "/dm/${userId}/read"
        // FIX #7: was method: "POST" — backend uses PATCH
        markDmRead: build.mutation<ApiResponse<null>, string>({
            query: (userId) => ({
                url: `/direct-messages/${userId}/read`,
                method: "PATCH",
            }),
            invalidatesTags: (_r, _e, userId) => [
                { type: "DirectMessage", id: userId },
            ],
        }),

        // GET /direct-messages/unread/count
        // FIX #6: was "/dm/unread" — route is /unread/count
        // FIX #8: response shape is { total, byConversation } not { counts: Record }
        getUnreadCounts: build.query<ApiResponse<UnreadCountResponse>, void>({
            query: () => "/direct-messages/unread/count",
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // FIX #8: map byConversation array → Record<userId, count> for the slice
                    const countsMap = data.data.byConversation.reduce<
                        Record<string, number>
                    >((acc, { _id, count }) => {
                        acc[_id] = count;
                        return acc;
                    }, {});
                    dispatch(setUnreadCounts(countsMap));
                } catch {
                    /* errors surfaced by RTK Query */
                }
            },
            providesTags: ["DirectMessage"],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetDmHistoryQuery,
    useSendDmMutation,
    useEditDmMutation,
    useDeleteDmMutation,
    useMarkDmReadMutation,
    useGetUnreadCountsQuery,
} = dmApi;
