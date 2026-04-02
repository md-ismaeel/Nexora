import { baseApi } from "@/api/base_api";
import type { ApiResponse } from "@/types/api.types";
import type { IChannel } from "@/types/server.types";

interface CategoryWithChannels {
  _id: string;
  name: string;
  server: string;
  position: number;
  channels: IChannel[];
  createdAt: string;
  updatedAt: string;
}

interface CategoriesResponse {
  categories: CategoryWithChannels[];
  uncategorized: IChannel[];
}

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ── Categories ───────────────────────────────────────────────────────────────

    // GET /servers/:serverId/categories
    getServerCategories: build.query<ApiResponse<CategoriesResponse>, string>({
      query: (serverId) => `/servers/${serverId}/categories`,
      providesTags: (_r, _e, id) => [{ type: "Channel", id }],
    }),

    // POST /servers/:serverId/categories
    createCategory: build.mutation<
      ApiResponse<CategoryWithChannels>,
      { serverId: string; name: string; position?: number }
    >({
      query: ({ serverId, ...body }) => ({
        url: `/servers/${serverId}/categories`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { serverId }) => [
        { type: "Channel", id: serverId },
      ],
    }),

    // PUT /servers/categories/:categoryId
    updateCategory: build.mutation<
      ApiResponse<CategoryWithChannels>,
      { categoryId: string; name?: string; position?: number }
    >({
      query: ({ categoryId, ...body }) => ({
        url: `/servers/categories/${categoryId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { categoryId }) => [{ type: "Channel", id: categoryId }],
    }),

    // DELETE /servers/categories/:categoryId
    deleteCategory: build.mutation<ApiResponse<null>, string>({
      query: (categoryId) => ({
        url: `/servers/categories/${categoryId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, categoryId) => [{ type: "Channel", id: categoryId }],
    }),

    // PUT /servers/:serverId/categories/reorder
    reorderCategories: build.mutation<
      ApiResponse<CategoryWithChannels[]>,
      { serverId: string; categoryOrder: Array<{ categoryId: string; position: number }> }
    >({
      query: ({ serverId, categoryOrder }) => ({
        url: `/servers/${serverId}/categories/reorder`,
        method: "PUT",
        body: { categoryOrder },
      }),
      invalidatesTags: (_r, _e, { serverId }) => [{ type: "Channel", id: serverId }],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetServerCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useReorderCategoriesMutation,
} = categoryApi;
