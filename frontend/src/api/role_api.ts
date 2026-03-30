import { baseApi } from "@/api/base_api";
import type { ApiResponse } from "@/types/api.types";

export interface IRole {
    _id: string;
    name: string;
    color: string;
    server: string;
    permissions: Record<string, boolean>;
    position: number;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

// ── Route note ────────────────────────────────────────────────────────────────
// The server mounts roleRouter under "/roles" in routes.ts.
// Inside roleRouter the paths are:
//   GET    /roles/:roleId
//   PATCH  /roles/:roleId
//   DELETE /roles/:roleId
//   PATCH  /roles/servers/:serverId/roles/reorder
//   POST   /roles/servers/:serverId/members/:memberId/roles/:roleId
//   DELETE /roles/servers/:serverId/members/:memberId/roles/:roleId
//
// Server-scoped role creation and listing live in serverRouter:
//   POST   /servers/:serverId/roles
//   GET    /servers/:serverId/roles
//
// FIX: original reorderRoles URL was /roles/servers/:serverId/roles/reorder
// which double-includes "roles" — the correct path relative to baseUrl is
// /roles/servers/:serverId/roles/reorder (the mount prefix /roles plus the
// route definition /servers/:serverId/roles/reorder).
// Actually this is correct — but verify it matches role.routes.ts exactly.

export const roleApi = baseApi.injectEndpoints({
    endpoints: (build) => ({

        // GET /servers/:serverId/roles  (registered in server.routes.ts)
        getServerRoles: build.query<ApiResponse<IRole[]>, string>({
            query: (serverId) => `/servers/${serverId}/roles`,
            providesTags: ["Role"],
        }),

        // GET /roles/:roleId
        getRole: build.query<ApiResponse<IRole>, string>({
            query: (roleId) => `/roles/${roleId}`,
            providesTags: (_r, _e, id) => [{ type: "Role", id }],
        }),

        // POST /servers/:serverId/roles  (registered in server.routes.ts)
        createRole: build.mutation<
            ApiResponse<IRole>,
            {
                serverId: string;
                name: string;
                color?: string;
                permissions?: Partial<IRole["permissions"]>;
            }
        >({
            query: ({ serverId, ...body }) => ({
                url: `/servers/${serverId}/roles`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["Role"],
        }),

        // PATCH /roles/:roleId
        updateRole: build.mutation<
            ApiResponse<IRole>,
            {
                roleId: string;
                name?: string;
                color?: string;
                permissions?: Partial<IRole["permissions"]>;
                position?: number;
            }
        >({
            query: ({ roleId, ...body }) => ({
                url: `/roles/${roleId}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: (_r, _e, { roleId }) => [
                { type: "Role", id: roleId },
            ],
        }),

        // DELETE /roles/:roleId
        deleteRole: build.mutation<ApiResponse<null>, string>({
            query: (roleId) => ({
                url: `/roles/${roleId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Role"],
        }),

        // PATCH /roles/servers/:serverId/roles/reorder
        // Full URL = baseUrl + /roles/servers/:serverId/roles/reorder
        // (mount "/roles" + route "/servers/:serverId/roles/reorder")
        reorderRoles: build.mutation<
            ApiResponse<IRole[]>,
            {
                serverId: string;
                roleOrder: Array<{ roleId: string; position: number }>;
            }
        >({
            query: ({ serverId, roleOrder }) => ({
                url: `/roles/servers/${serverId}/roles/reorder`,
                method: "PATCH",
                body: { roleOrder },
            }),
            invalidatesTags: ["Role"],
        }),

        // POST /roles/servers/:serverId/members/:memberId/roles/:roleId
        assignRole: build.mutation<
            ApiResponse<null>,
            { serverId: string; memberId: string; roleId: string }
        >({
            query: ({ serverId, memberId, roleId }) => ({
                url: `/roles/servers/${serverId}/members/${memberId}/roles/${roleId}`,
                method: "POST",
            }),
            invalidatesTags: ["Role"],
        }),

        // DELETE /roles/servers/:serverId/members/:memberId/roles/:roleId
        removeRole: build.mutation<
            ApiResponse<null>,
            { serverId: string; memberId: string; roleId: string }
        >({
            query: ({ serverId, memberId, roleId }) => ({
                url: `/roles/servers/${serverId}/members/${memberId}/roles/${roleId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Role"],
        }),

    }),
    overrideExisting: false,
});

export const {
    useGetServerRolesQuery,
    useGetRoleQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation,
    useReorderRolesMutation,
    useAssignRoleMutation,
    useRemoveRoleMutation,
} = roleApi;