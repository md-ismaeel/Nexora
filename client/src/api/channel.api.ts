import { baseApi } from "@/api/base.api";
import type { ApiResponse } from "@/types/api.types";
import type { IChannel } from "@/types/server.types";

export const channelApi = baseApi.injectEndpoints({
    endpoints: (build) => ({

        // GET /servers/:serverId/channels
        getChannels: build.query<ApiResponse<{ channels: IChannel[] }>, string>({
            query: (serverId) => `/servers/${serverId}/channels`,
            providesTags: (_r, _e, serverId) => [{ type: "Channel", id: serverId }],
        }),

        // GET /servers/channels/:id
        // FIX #12: was "/channels/${id}" — these routes live under the serverRouter
        // and are registered as /servers/channels/:channelId
        getChannelById: build.query<ApiResponse<{ channel: IChannel }>, string>({
            query: (id) => `/servers/channels/${id}`,
            providesTags: (_r, _e, id) => [{ type: "Channel", id }],
        }),

        // POST /servers/:serverId/channels
        createChannel: build.mutation<
            ApiResponse<{ channel: IChannel }>,
            {
                serverId: string;
                name: string;
                type?: "text" | "voice";
                topic?: string;
                isPrivate?: boolean;
            }
        >({
            query: ({ serverId, ...body }) => ({
                url: `/servers/${serverId}/channels`,
                method: "POST",
                body,
            }),
            invalidatesTags: (_r, _e, { serverId }) => [
                { type: "Channel", id: serverId },
            ],
        }),

        // PATCH /servers/channels/:id
        // FIX #12: was "/channels/${id}"
        updateChannel: build.mutation<
            ApiResponse<{ channel: IChannel }>,
            {
                id: string;
                name?: string;
                topic?: string;
                isPrivate?: boolean;
                position?: number;
            }
        >({
            query: ({ id, ...body }) => ({
                url: `/servers/channels/${id}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: (_r, _e, { id }) => [{ type: "Channel", id }],
        }),

        // DELETE /servers/channels/:id
        // FIX #12: was "/channels/${id}"
        deleteChannel: build.mutation<ApiResponse<null>, string>({
            query: (id) => ({
                url: `/servers/channels/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Channel"],
        }),

    }),
    overrideExisting: false,
});

export const {
    useGetChannelsQuery,
    useGetChannelByIdQuery,
    useCreateChannelMutation,
    useUpdateChannelMutation,
    useDeleteChannelMutation,
} = channelApi;