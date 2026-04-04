import { baseApi } from "@/api/base_api";
import type { ApiResponse } from "@/types/api.types";
import type { IChannel } from "@/types/server.types";

// ── Response shape note ───────────────────────────────────────────────────────
// Server returns channels as a flat array directly in data.data:
//   GET /servers/:serverId/channels → { success, message, data: IChannel[] }
// FIX: original typed as ApiResponse<{ channels: IChannel[] }> requiring
// data.data.channels — but data.data IS the IChannel[] array.

export const channelApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    // GET /servers/:serverId/channels
    getChannels: build.query<ApiResponse<IChannel[]>, string>({
      query: (serverId) => `/servers/${serverId}/channels`,
      providesTags: (_r, _e, serverId) => [{ type: "Channel", id: serverId }],
    }),

    // GET /servers/channels/:channelId
    // Registered under serverRouter as /channels/:channelId
    // Full path: /servers/channels/:channelId
    getChannelById: build.query<ApiResponse<IChannel>, string>({
      query: (id) => `/servers/channels/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Channel", id }],
    }),

    // POST /servers/:serverId/channels
    createChannel: build.mutation<
      ApiResponse<IChannel>,
      {
        serverId: string;
        name: string;
        type?: "text" | "voice";
        topic?: string;
        category?: string;
        isPrivate?: boolean;
        position?: number;
        allowedRoles?: string[];
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

    // PATCH /servers/channels/:channelId
    updateChannel: build.mutation<
      ApiResponse<IChannel>,
      {
        id: string;
        name?: string;
        topic?: string;
        category?: string;
        isPrivate?: boolean;
        position?: number;
        allowedRoles?: string[];
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/servers/channels/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Channel", id }],
    }),

    // DELETE /servers/channels/:channelId
    deleteChannel: build.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/servers/channels/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Channel"],
    }),

    // PATCH /servers/:serverId/channels/reorder
    reorderChannels: build.mutation<
      ApiResponse<IChannel[]>,
      {
        serverId: string;
        channelOrder: Array<{ channelId: string; position: number }>;
      }
    >({
      query: ({ serverId, channelOrder }) => ({
        url: `/servers/${serverId}/channels/reorder`,
        method: "PATCH",
        body: { channelOrder },
      }),
      invalidatesTags: (_r, _e, { serverId }) => [
        { type: "Channel", id: serverId },
      ],
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
  useReorderChannelsMutation,
} = channelApi;