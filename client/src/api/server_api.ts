import { baseApi } from "@/api/base_api";
import {
  setServers,
  addServer,
  removeServer,
  updateServerInList,
} from "@/store/slices/server_slice";
import type { ApiResponse } from "@/types/api.types";
import type { IServer, IServerMember, IInvite } from "@/types/server.types";

interface ServerDiscoveryResponse {
  servers: IServer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface BanRecord {
  user: { _id: string; username: string; avatar?: string };
  bannedBy: string;
  reason: string;
  bannedAt: string;
}

export const serverApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    // ── Server CRUD ───────────────────────────────────────────────────────────

    // GET /servers
    // FIX: server returns the array directly as `data` (not `data.servers`).
    // The backend sendSuccess wraps the array as the data field:
    //   { success, message, data: IServer[] }
    // So the response type is ApiResponse<IServer[]>, not ApiResponse<{ servers: IServer[] }>.
    getMyServers: build.query<ApiResponse<IServer[]>, void>({
      query: () => "/servers",
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // data.data is the IServer[] array directly
          dispatch(setServers(data.data));
        } catch {
          /* surfaced by RTK Query */
        }
      },
      providesTags: ["Server"],
    }),

    // GET /servers/:id
    getServerById: build.query<ApiResponse<IServer>, string>({
      query: (id) => `/servers/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Server", id }],
    }),

    // POST /servers
    createServer: build.mutation<
      ApiResponse<IServer>,
      { name: string; description?: string; isPublic?: boolean }
    >({
      query: (body) => ({ url: "/servers", method: "POST", body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(addServer(data.data));
        } catch {
          /* surfaced by RTK Query */
        }
      },
      invalidatesTags: ["Server"],
    }),

    // PATCH /servers/:id
    updateServer: build.mutation<
      ApiResponse<IServer>,
      {
        id: string;
        name?: string;
        description?: string;
        icon?: string | null;
        banner?: string | null;
        isPublic?: boolean;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/servers/${id}`,
        method: "PATCH",
        body,
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(updateServerInList({ ...data.data, _id: id }));
        } catch {
          /* surfaced by RTK Query */
        }
      },
      invalidatesTags: (_r, _e, { id }) => [{ type: "Server", id }],
    }),

    // DELETE /servers/:id
    deleteServer: build.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/servers/${id}`, method: "DELETE" }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(removeServer(id));
        } catch {
          /* surfaced by RTK Query */
        }
      },
      invalidatesTags: ["Server"],
    }),

    // POST /servers/:id/leave
    leaveServer: build.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/servers/${id}/leave`, method: "POST" }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(removeServer(id));
        } catch {
          /* surfaced by RTK Query */
        }
      },
      invalidatesTags: ["Server"],
    }),

    // ── Members ───────────────────────────────────────────────────────────────

    // GET /servers/:id/members
    getServerMembers: build.query<ApiResponse<IServerMember[]>, string>({
      query: (id) => `/servers/${id}/members`,
      providesTags: (_r, _e, id) => [{ type: "Server", id }],
    }),

    // PATCH /servers/:serverId/members/:memberId/role
    updateMemberRole: build.mutation<
      ApiResponse<IServerMember>,
      {
        serverId: string;
        memberId: string;
        role: Exclude<IServerMember["role"], "owner">;
      }
    >({
      query: ({ serverId, memberId, role }) => ({
        url: `/servers/${serverId}/members/${memberId}/role`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: ["Server"],
    }),

    // DELETE /servers/:serverId/members/:memberId  (kick)
    kickMember: build.mutation<
      ApiResponse<null>,
      { serverId: string; memberId: string }
    >({
      query: ({ serverId, memberId }) => ({
        url: `/servers/${serverId}/members/${memberId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Server"],
    }),

    // ── Invites ───────────────────────────────────────────────────────────────

    // GET /invites/:code  (public — no auth required)
    getInvite: build.query<ApiResponse<IInvite>, string>({
      query: (code) => `/invites/${code}`,
      providesTags: (_r, _e, code) => [{ type: "Invite", id: code }],
    }),

    // POST /invites/:code/join
    joinServer: build.mutation<
      ApiResponse<{ server: IServer; member: IServerMember }>,
      string
    >({
      query: (code) => ({ url: `/invites/${code}/join`, method: "POST" }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(addServer(data.data.server));
        } catch {
          /* surfaced by RTK Query */
        }
      },
      invalidatesTags: ["Server"],
    }),

    // POST /servers/:serverId/invites
    createInvite: build.mutation<
      ApiResponse<IInvite>,
      { serverId: string; maxUses?: number; expiresIn?: number }
    >({
      query: ({ serverId, ...body }) => ({
        url: `/servers/${serverId}/invites`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Invite"],
    }),

    // GET /servers/:serverId/invites
    getServerInvites: build.query<ApiResponse<IInvite[]>, string>({
      query: (serverId) => `/servers/${serverId}/invites`,
      providesTags: ["Invite"],
    }),

    // DELETE /invites/:code
    deleteInvite: build.mutation<ApiResponse<null>, string>({
      query: (code) => ({ url: `/invites/${code}`, method: "DELETE" }),
      invalidatesTags: ["Invite"],
    }),

    // ── Ban/Unban ───────────────────────────────────────────────────────────────

    // POST /servers/:serverId/members/:memberId/ban
    banMember: build.mutation<
      ApiResponse<null>,
      { serverId: string; memberId: string; reason?: string }
    >({
      query: ({ serverId, memberId, reason }) => ({
        url: `/servers/${serverId}/members/${memberId}/ban`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["Server"],
    }),

    // DELETE /servers/:serverId/bans/:userId
    unbanMember: build.mutation<
      ApiResponse<null>,
      { serverId: string; userId: string }
    >({
      query: ({ serverId, userId }) => ({
        url: `/servers/${serverId}/bans/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Server"],
    }),

    // GET /servers/:serverId/bans
    getServerBans: build.query<ApiResponse<BanRecord[]>, string>({
      query: (serverId) => `/servers/${serverId}/bans`,
      providesTags: (_r, _e, id) => [{ type: "Server", id }],
    }),

    // ── Discovery ───────────────────────────────────────────────────────────────

    // GET /servers/discover/public
    getPublicServers: build.query<
      ApiResponse<ServerDiscoveryResponse>,
      { limit?: number; page?: number }
    >({
      query: ({ limit, page }) => ({
        url: "/servers/discover/public",
        params: { limit, page },
      }),
      providesTags: ["Server"],
    }),

    // GET /servers/discover/search
    searchPublicServers: build.query<
      ApiResponse<ServerDiscoveryResponse>,
      { q: string; limit?: number; page?: number }
    >({
      query: ({ q, limit, page }) => ({
        url: "/servers/discover/search",
        params: { q, limit, page },
      }),
      providesTags: ["Server"],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetMyServersQuery,
  useGetServerByIdQuery,
  useCreateServerMutation,
  useUpdateServerMutation,
  useDeleteServerMutation,
  useLeaveServerMutation,
  useGetServerMembersQuery,
  useUpdateMemberRoleMutation,
  useKickMemberMutation,
  useGetInviteQuery,
  useJoinServerMutation,
  useCreateInviteMutation,
  useGetServerInvitesQuery,
  useDeleteInviteMutation,
  useBanMemberMutation,
  useUnbanMemberMutation,
  useGetServerBansQuery,
  useGetPublicServersQuery,
  useSearchPublicServersQuery,
} = serverApi;