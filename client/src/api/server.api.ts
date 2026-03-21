import { baseApi } from "@/api/base.api";
import { setServers, addServer, removeServer } from "@/store/slices/server.slice";
import type { ApiResponse } from "@/types/api.types";
import type { IServer, IServerMember, IInvite } from "@/types/server.types";

export const serverApi = baseApi.injectEndpoints({
    endpoints: (build) => ({

        // GET /servers
        getMyServers: build.query<ApiResponse<{ servers: IServer[] }>, void>({
            query: () => "/servers",
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setServers(data.data.servers));
                } catch (error) {
                    /* errors surfaced by RTK Query */
                    console.log("error", error)
                }
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
                } catch (error) {
                    /* errors surfaced by RTK Query */
                    console.log("error", error)
                }
            },
            invalidatesTags: ["Server"],
        }),

        // PATCH /servers/:id
        updateServer: build.mutation<
            ApiResponse<{ server: IServer }>,
            { id: string; name?: string; description?: string; isPublic?: boolean }
        >({
            query: ({ id, ...body }) => ({
                url: `/servers/${id}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: (_r, _e, { id }) => [{ type: "Server", id }],
        }),

        // DELETE /servers/:id
        deleteServer: build.mutation<ApiResponse<null>, string>({
            query: (id) => ({ url: `/servers/${id}`, method: "DELETE" }),
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(removeServer(id));
                } catch (error) {
                    /* errors surfaced by RTK Query */
                    console.log("error", error)
                }
            },
            invalidatesTags: ["Server"],
        }),

        // POST /invites/:code/use
        joinServer: build.mutation<ApiResponse<{ server: IServer }>, string>({
            query: (inviteCode) => ({
                url: `/invites/${inviteCode}/use`,
                method: "POST",
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(addServer(data.data.server));
                } catch (error) {
                    /* errors surfaced by RTK Query */
                    console.log("error", error)
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
                } catch (error) {
                    /* errors surfaced by RTK Query */
                    console.log("error", error)
                }
            },
            invalidatesTags: ["Server"],
        }),

        // GET /servers/:id/members
        getServerMembers: build.query<
            ApiResponse<{ members: IServerMember[] }>,
            string
        >({
            query: (id) => `/servers/${id}/members`,
            providesTags: (_r, _e, id) => [{ type: "Server", id }],
        }),

        // POST /servers/:serverId/members/:userId/kick
        kickMember: build.mutation<
            ApiResponse<null>,
            { serverId: string; userId: string }
        >({
            query: ({ serverId, userId }) => ({
                url: `/servers/${serverId}/members/${userId}/kick`,
                method: "POST",
            }),
            invalidatesTags: ["Server"],
        }),

        // POST /servers/:serverId/members/:userId/ban
        banMember: build.mutation<
            ApiResponse<null>,
            { serverId: string; userId: string; reason?: string }
        >({
            query: ({ serverId, userId, ...body }) => ({
                url: `/servers/${serverId}/members/${userId}/ban`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["Server"],
        }),

        // ── Invites

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

        // DELETE /servers/:serverId/invites/:inviteId
        deleteInvite: build.mutation<
            ApiResponse<null>,
            { serverId: string; inviteId: string }
        >({
            query: ({ serverId, inviteId }) => ({
                url: `/servers/${serverId}/invites/${inviteId}`,
                method: "DELETE",
            }),
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
    useJoinServerMutation,
    useLeaveServerMutation,
    useGetServerMembersQuery,
    useKickMemberMutation,
    useBanMemberMutation,
    useCreateInviteMutation,
    useGetServerInvitesQuery,
    useDeleteInviteMutation,
} = serverApi;