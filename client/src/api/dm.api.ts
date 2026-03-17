import { baseApi } from "./base.api";
import { setDms, setUnreadCounts } from "@/store/slices/dm.slice";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api.types";
import type { IDirectMessage } from "@/types/message.types";

export const dmApi = baseApi.injectEndpoints({
    endpoints: (build) => ({

        // GET /dm/:userId
        getDmHistory: build.query<
            PaginatedResponse<IDirectMessage>,
            { userId: string } & PaginationParams
        >({
            query: ({ userId, page = 1, limit = 50 }) =>
                `/dm/${userId}?page=${page}&limit=${limit}`,
            async onQueryStarted({ userId }, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setDms({ userId, messages: data.data.items }));
                } catch (error) {
                    /* errors surfaced by RTK Query */
                    console.log("error", error)
                }
            },
            providesTags: (_r, _e, { userId }) => [
                { type: "DirectMessage", id: userId },
            ],
        }),

        // POST /dm/:receiverId
        sendDm: build.mutation<
            ApiResponse<{ message: IDirectMessage }>,
            { receiverId: string; content: string }
        >({
            query: ({ receiverId, content }) => ({
                url: `/dm/${receiverId}`,
                method: "POST",
                body: { content },
            }),
            invalidatesTags: (_r, _e, { receiverId }) => [
                { type: "DirectMessage", id: receiverId },
            ],
        }),

        // PATCH /dm/messages/:messageId
        editDm: build.mutation<
            ApiResponse<{ message: IDirectMessage }>,
            { messageId: string; content: string }
        >({
            query: ({ messageId, content }) => ({
                url: `/dm/messages/${messageId}`,
                method: "PATCH",
                body: { content },
            }),
            invalidatesTags: ["DirectMessage"],
        }),

        // DELETE /dm/messages/:messageId
        deleteDm: build.mutation<ApiResponse<null>, string>({
            query: (messageId) => ({
                url: `/dm/messages/${messageId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["DirectMessage"],
        }),

        // POST /dm/:userId/read
        markDmRead: build.mutation<ApiResponse<null>, string>({
            query: (userId) => ({
                url: `/dm/${userId}/read`,
                method: "POST",
            }),
            invalidatesTags: (_r, _e, userId) => [
                { type: "DirectMessage", id: userId },
            ],
        }),

        // GET /dm/unread
        getUnreadCounts: build.query<
            ApiResponse<{ counts: Record<string, number> }>,
            void
        >({
            query: () => "/dm/unread",
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setUnreadCounts(data.data.counts));
                } catch (error) {
                    /* errors surfaced by RTK Query */
                    console.log("error", error)
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