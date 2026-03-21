import { baseApi } from "@/api/base.api";
import { setMessages } from "@/store/slices/message.slice";
import type { ApiResponse, PaginationParams } from "@/types/api.types";
import type { IMessage } from "@/types/message.types";

// Response shape matching the backend exactly
interface MessagesResponse {
    messages: IMessage[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
        hasMore: boolean;
    };
}

export const messageApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        // GET /channels/:channelId/messages
        // FIX #10: backend returns data.data.messages not data.data.items
        getMessages: build.query<
            ApiResponse<MessagesResponse>,
            { channelId: string } & PaginationParams
        >({
            query: ({ channelId, page = 1, limit = 50 }) =>
                `/channels/${channelId}/messages?page=${page}&limit=${limit}`,
            async onQueryStarted({ channelId }, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // FIX #10: was data.data.items — backend key is "messages"
                    dispatch(setMessages({ channelId, messages: data.data.messages }));
                } catch {
                    /* errors surfaced by RTK Query */
                }
            },
            providesTags: (_r, _e, { channelId }) => [
                { type: "Message", id: channelId },
            ],
        }),

        // POST /channels/:channelId/messages
        sendMessage: build.mutation<
            ApiResponse<{ message: IMessage }>,
            { channelId: string; content: string; replyTo?: string }
        >({
            query: ({ channelId, ...body }) => ({
                url: `/channels/${channelId}/messages`,
                method: "POST",
                body,
            }),
            invalidatesTags: (_r, _e, { channelId }) => [
                { type: "Message", id: channelId },
            ],
        }),

        // PATCH /messages/:messageId
        editMessage: build.mutation<
            ApiResponse<{ message: IMessage }>,
            { messageId: string; content: string }
        >({
            query: ({ messageId, content }) => ({
                url: `/messages/${messageId}`,
                method: "PATCH",
                body: { content },
            }),
            invalidatesTags: ["Message"],
        }),

        // DELETE /messages/:messageId
        deleteMessage: build.mutation<ApiResponse<null>, string>({
            query: (messageId) => ({
                url: `/messages/${messageId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Message"],
        }),

        // POST /messages/:messageId/reactions
        addReaction: build.mutation<
            ApiResponse<null>,
            { messageId: string; emoji: string }
        >({
            query: ({ messageId, emoji }) => ({
                url: `/messages/${messageId}/reactions`,
                method: "POST",
                body: { emoji },
            }),
            invalidatesTags: ["Message"],
        }),

        // DELETE /messages/:messageId/reactions/:emoji
        removeReaction: build.mutation<
            ApiResponse<null>,
            { messageId: string; emoji: string }
        >({
            query: ({ messageId, emoji }) => ({
                url: `/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Message"],
        }),

        // PATCH /messages/:messageId/pin
        // FIX #11: was two separate mutations (POST pinMessage + DELETE unpinMessage)
        // Backend has ONE toggle endpoint: PATCH /messages/:messageId/pin
        togglePinMessage: build.mutation<
            ApiResponse<{ message: IMessage }>,
            string
        >({
            query: (messageId) => ({
                url: `/messages/${messageId}/pin`,
                method: "PATCH",
            }),
            invalidatesTags: ["Message"],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetMessagesQuery,
    useSendMessageMutation,
    useEditMessageMutation,
    useDeleteMessageMutation,
    useAddReactionMutation,
    useRemoveReactionMutation,
    useTogglePinMessageMutation,
} = messageApi;
