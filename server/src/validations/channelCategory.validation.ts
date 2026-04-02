import { z } from "zod";

export const channelCategoryValidation = {
  createCategory: z.object({
    name: z
      .string()
      .min(1, "Category name is required")
      .max(100, "Category name cannot exceed 100 characters"),
    position: z.number().optional(),
  }),

  updateCategory: z.object({
    name: z
      .string()
      .min(1, "Category name is required")
      .max(100, "Category name cannot exceed 100 characters")
      .optional(),
    position: z.number().optional(),
  }),

  reorderCategories: z.object({
    categoryOrder: z.array(
      z.object({
        categoryId: z.string().min(1, "Category ID is required"),
        position: z.number(),
      })
    ),
  }),
};