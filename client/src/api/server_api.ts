import { baseApi } from "@/api/base_api";
import { setServers, addServer, removeServer, updateServerInList } from "@/store/slices/server_slice";
import type { ApiResponse } from "@/types/api.types";
import type { IServer, IServerMember, IInvite } from "@/types/server.types";

export const serverApi = baseApi.injectEndpoints({
    endpoints: (build) => ({

        // ── Server CRUD ───────────────────────────────────────────────────────────

        // GET /servers
        getMyServers: build.query<ApiResponse<{ servers: IServer[] }>, void>({
            query: () => "/servers",
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setServers(data.data.servers));
                } catch { /* surfaced by RTK Query */ }
            },
            providesTags: ["Server"],
        }),

        // GET /servers/:id
        getServerById: build.query<ApiResponse<{ server: IServer }>, string>({
            query: (id) => `/servers/${id}`,
            providesTags: (_r, _e, id) => [{ type: "Server", id }],
        }),

        // POST /servers
        createServer: build.mutation<
            ApiResponse<{ server: IServer }>,
            { name: string; description?: string; isPublic?: boolean }
        >({
            query: (body) => ({ url: "/servers", method: "POST", body }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(addServer(data.data.server));
                } catch { /* surfaced by RTK Query */ }
            },
            invalidatesTags: ["Server"],
        }),

        // PATCH /servers/:id
        updateServer: build.mutation<
            ApiResponse<{ server: IServer }>,
            { id: string; name?: string; description?: string; icon?: string | null; banner?: string | null; isPublic?: boolean }
        >({
            query: ({ id, ...body }) => ({ url: `/servers/${id}`, method: "PATCH", body }),
            async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(updateServerInList({ _id: id, ...data.data.server }));
                } catch { /* surfaced by RTK Query */ }
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
                } catch { /* surfaced by RTK Query */ }
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
                } catch { /* surfaced by RTK Query */ }
            },
            invalidatesTags: ["Server"],
        }),

        // ── Members ───────────────────────────────────────────────────────────────

        // GET /servers/:id/members
        getServerMembers: build.query<
            ApiResponse<{ members: IServerMember[] }>,
            string
        >({
            query: (id) => `/servers/${id}/members`,
            providesTags: (_r, _e, id) => [{ type: "Server", id }],
        }),

        // PATCH /servers/:serverId/members/:memberId/role
        updateMemberRole: build.mutation<
            ApiResponse<{ member: IServerMember }>,
            { serverId: string; memberId: string; role: Exclude<IServerMember["role"], "owner"> }
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

        // GET /invites/:code  (public — no auth)
        getInvite: build.query<ApiResponse<{ invite: IInvite }>, string>({
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
                } catch { /* surfaced by RTK Query */ }
            },
            invalidatesTags: ["Server"],
        }),

        // POST /servers/:serverId/invites
        createInvite: build.mutation<
            ApiResponse<{ invite: IInvite }>,
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
        getServerInvites: build.query<ApiResponse<{ invites: IInvite[] }>, string>({
            query: (serverId) => `/servers/${serverId}/invites`,
            providesTags: ["Invite"],
        }),

        // DELETE /invites/:code
        deleteInvite: build.mutation<ApiResponse<null>, string>({
            query: (code) => ({ url: `/invites/${code}`, method: "DELETE" }),
            invalidatesTags: ["Invite"],
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
} = serverApi;