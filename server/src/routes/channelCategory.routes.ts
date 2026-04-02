import { Router } from "express";
import { createCategory, getServerCategories, updateCategory, deleteCategory, reorderCategories } from "@/controllers/channelCategory.controller";
import { authenticated } from "@/middlewares/auth.middleware";
import { validateBody } from "@/middlewares/validate.middleware";
import { channelCategoryValidation } from "@/validations/channelCategory.validation";

const router = Router();

router.post(
  "/:serverId/categories",
  authenticated,
  validateBody(channelCategoryValidation.createCategory),
  createCategory
);

router.get(
  "/:serverId/categories",
  authenticated,
  getServerCategories
);

router.put(
  "/categories/:categoryId",
  authenticated,
  validateBody(channelCategoryValidation.updateCategory),
  updateCategory
);

router.delete(
  "/categories/:categoryId",
  authenticated,
  deleteCategory
);

router.put(
  "/:serverId/categories/reorder",
  authenticated,
  validateBody(channelCategoryValidation.reorderCategories),
  reorderCategories
);

export default router;