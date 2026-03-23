import { baseApi } from "@/api/base_api";
import {
    setMessages,
    addMessage,
    updateMessage,
    removeMessage,
    togglePinInCache,
} from "@/store/slices/message_slice";
import type { ApiResponse, PaginationParams } from "@/types/api.types";
import type { IMessage } from "@/types/message.types";

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
        getMessages: build.query<
            ApiResponse<MessagesResponse>,
            { channelId: string } & PaginationParams
        >({
            query: ({ channelId, page = 1, limit = 50 }) =>
                `/channels/${channelId}/messages?page=${page}&limit=${limit}`,
            async onQueryStarted({ channelId }, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // Backend key is "messages" not "items"
                    dispatch(setMessages({ channelId, messages: data.data.messages }));
                } catch {
                    /* surfaced by RTK Query */
                }
            },
            providesTags: (_r, _e, { channelId }) => [
                { type: "Message", id: channelId },
            ],
        }),

        // POST /channels/:channelId/messages
        sendMessage: build.mutation<
            ApiResponse<{ message: IMessage }>,
            {
                channelId: string;
                content: string;
                replyTo?: string;
                mentions?: string[];
            }
        >({
            query: ({ channelId, ...body }) => ({
                url: `/channels/${channelId}/messages`,
                method: "POST",
                body,
            }),
            async onQueryStarted({ channelId }, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // Immediately push to local cache — socket event will deduplicate
                    dispatch(addMessage(data.data.message));
                } catch {
                    /* surfaced by RTK Query */
                }
            },
            invalidatesTags: (_r, _e, { channelId }) => [
                { type: "Message", id: channelId },
            ],
        }),

        // GET /channels/:channelId/messages/pinned
        getPinnedMessages: build.query<
            ApiResponse<{ messages: IMessage[] }>,
            string
        >({
            query: (channelId) => `/channels/${channelId}/messages/pinned`,
            providesTags: (_r, _e, channelId) => [
                { type: "Message", id: `${channelId}_pinned` },
            ],
        }),

        // GET /messages/:messageId
        getMessage: build.query<ApiResponse<{ message: IMessage }>, string>({
            query: (messageId) => `/messages/${messageId}`,
            providesTags: (_r, _e, id) => [{ type: "Message", id }],
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
            async onQueryStarted({ messageId }, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(updateMessage(data.data.message));
                } catch {
                    /* surfaced by RTK Query */
                }
            },
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

        // PATCH /messages/:messageId/pin  (toggles isPinned)
        togglePinMessage: build.mutation<
            ApiResponse<{ message: IMessage }>,
            string
        >({
            query: (messageId) => ({
                url: `/messages/${messageId}/pin`,
                method: "PATCH",
            }),
            async onQueryStarted(messageId, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    const { message } = data.data;
                    dispatch(
                        togglePinInCache({
                            messageId,
                            channelId: message.channel as string,
                            isPinned: message.isPinned,
                        }),
                    );
                } catch {
                    /* surfaced by RTK Query */
                }
            },
            invalidatesTags: ["Message"],
        }),

        // POST /messages/:messageId/reactions
        addReaction: build.mutation<
            ApiResponse<{ message: IMessage }>,
            { messageId: string; emoji: string }
        >({
            query: ({ messageId, emoji }) => ({
                url: `/messages/${messageId}/reactions`,
                method: "POST",
                body: { emoji },
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(updateMessage(data.data.message));
                } catch {
                    /* surfaced by RTK Query */
                }
            },
            invalidatesTags: ["Message"],
        }),

        // DELETE /messages/:messageId/reactions/:emoji
        removeReaction: build.mutation<
            ApiResponse<{ message: IMessage }>,
            { messageId: string; emoji: string }
        >({
            query: ({ messageId, emoji }) => ({
                url: `/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`,
                method: "DELETE",
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(updateMessage(data.data.message));
                } catch {
                    /* surfaced by RTK Query */
                }
            },
            invalidatesTags: ["Message"],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetMessagesQuery,
    useSendMessageMutation,
    useGetPinnedMessagesQuery,
    useGetMessageQuery,
    useEditMessageMutation,
    useDeleteMessageMutation,
    useTogglePinMessageMutation,
    useAddReactionMutation,
    useRemoveReactionMutation,
} = messageApi;
