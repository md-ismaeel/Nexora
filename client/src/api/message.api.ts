import { baseApi } from "./base.api";
import { setMessages } from "@/store/slices/message.slice";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api.types";
import type { IMessage } from "@/types/message.types";

export const messageApi = baseApi.injectEndpoints({
    endpoints: (build) => ({

        // GET /channels/:channelId/messages
        getMessages: build.query<
            PaginatedResponse<IMessage>,
            { channelId: string } & PaginationParams
        >({
            query: ({ channelId, page = 1, limit = 50 }) =>
                `/channels/${channelId}/messages?page=${page}&limit=${limit}`,
            async onQueryStarted({ channelId }, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setMessages({ channelId, messages: data.data.items }));
                } catch (error) {
                    /* errors surfaced by RTK Query */
                    console.log("error", error)
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

        // POST /messages/:messageId/pin
        pinMessage: build.mutation<ApiResponse<null>, string>({
            query: (messageId) => ({
                url: `/messages/${messageId}/pin`,
                method: "POST",
            }),
            invalidatesTags: ["Message"],
        }),

        // DELETE /messages/:messageId/pin
        unpinMessage: build.mutation<ApiResponse<null>, string>({
            query: (messageId) => ({
                url: `/messages/${messageId}/pin`,
                method: "DELETE",
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
    usePinMessageMutation,
    useUnpinMessageMutation,
} = messageApi;