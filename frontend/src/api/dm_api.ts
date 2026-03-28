import { baseApi } from "@/api/base_api";
import {
    setDms,
    setUnreadCounts,
    setConversations,
    addDm,
} from "@/store/slices/dm_slice";
import type { ApiResponse, PaginationParams } from "@/types/api.types";
import type { IDirectMessage } from "@/types/message.types";

// ── Response types matching the backend exactly ───────────────────────────────

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

interface UnreadCountResponse {
    total: number;
    byConversation: Array<{ _id: string; count: number }>;
}

interface ConversationListItem {
    user: unknown;
    lastMessage: IDirectMessage | null;
    unreadCount: number;
}

export const dmApi = baseApi.injectEndpoints({
    endpoints: (build) => ({

        // GET /direct-messages/:userId  (paginated)
        getDmHistory: build.query<
            ApiResponse<ConversationResponse>,
            { userId: string } & PaginationParams
        >({
            query: ({ userId, page = 1, limit = 50 }) =>
                `/direct-messages/${userId}?page=${page}&limit=${limit}`,
            async onQueryStarted({ userId }, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // Backend key is "messages" (not "items")
                    dispatch(setDms({ userId, messages: data.data.messages }));
                } catch { /* surfaced by RTK Query */ }
            },
            providesTags: (_r, _e, { userId }) => [
                { type: "DirectMessage", id: userId },
            ],
        }),

        // GET /direct-messages  — all conversations for the DM sidebar
        getConversations: build.query<
            ApiResponse<ConversationListItem[]>,
            void
        >({
            query: () => "/direct-messages",
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // Map to the slice's Conversation shape
                    dispatch(
                        setConversations(
                            data.data.map((c) => ({
                                userId: (c.user as { _id: string })?._id ?? "",
                                lastMessage: c.lastMessage,
                                unreadCount: c.unreadCount,
                            })),
                        ),
                    );
                } catch { /* surfaced by RTK Query */ }
            },
            providesTags: ["DirectMessage"],
        }),

        // GET /direct-messages/unread/count
        getUnreadCounts: build.query<ApiResponse<UnreadCountResponse>, void>({
            query: () => "/direct-messages/unread/count",
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // Map byConversation array → Record<userId, count>
                    const countsMap = data.data.byConversation.reduce<
                        Record<string, number>
                    >((acc, { _id, count }) => {
                        acc[_id] = count;
                        return acc;
                    }, {});
                    dispatch(setUnreadCounts(countsMap));
                } catch { /* surfaced by RTK Query */ }
            },
            providesTags: ["DirectMessage"],
        }),

        // POST /direct-messages/:recipientId
        sendDm: build.mutation<
            ApiResponse<{ message: IDirectMessage }>,
            { receiverId: string; content: string }
        >({
            query: ({ receiverId, content }) => ({
                url: `/direct-messages/${receiverId}`,
                method: "POST",
                body: { content },
            }),
            async onQueryStarted({ receiverId }, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // Push into local cache immediately
                    dispatch(addDm({ userId: receiverId, message: data.data.message }));
                } catch { /* surfaced by RTK Query */ }
            },
            invalidatesTags: (_r, _e, { receiverId }) => [
                { type: "DirectMessage", id: receiverId },
            ],
        }),

        // PATCH /direct-messages/message/:messageId
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
        deleteDm: build.mutation<ApiResponse<null>, string>({
            query: (messageId) => ({
                url: `/direct-messages/message/${messageId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["DirectMessage"],
        }),

        // PATCH /direct-messages/:userId/read
        markDmRead: build.mutation<ApiResponse<null>, string>({
            query: (userId) => ({
                url: `/direct-messages/${userId}/read`,
                method: "PATCH",
            }),
            invalidatesTags: (_r, _e, userId) => [
                { type: "DirectMessage", id: userId },
            ],
        }),

        // DELETE /direct-messages/:userId  — delete entire conversation
        deleteConversation: build.mutation<ApiResponse<null>, string>({
            query: (userId) => ({
                url: `/direct-messages/${userId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["DirectMessage"],
        }),

    }),
    overrideExisting: false,
});

export const {
    useGetDmHistoryQuery,
    useGetConversationsQuery,
    useGetUnreadCountsQuery,
    useSendDmMutation,
    useEditDmMutation,
    useDeleteDmMutation,
    useMarkDmReadMutation,
    useDeleteConversationMutation,
} = dmApi;