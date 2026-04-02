import type { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiError } from "@/utils/ApiError";
import { sendSuccess, sendCreated } from "@/utils/response";
import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { SUCCESS_MESSAGES } from "@/constants/successMessages";
import type { IChannelCategory, IServerMember } from "@/types/models";
import { ChannelCategoryModel } from "@/models/channelCategory.model";
import { ChannelModel } from "@/models/channel.model";
import { ServerModel } from "@/models/server.model";
import { ServerMemberModel } from "@/models/serverMember.model";
import { pubClient } from "@/config/redis.config";
import { validateObjectId } from "@/utils/validateObjId";

const checkMemberPermission = async (
  serverId: string,
  userId: string,
  requiredRoles: IServerMember["role"][] = ["owner", "admin"]
): Promise<IServerMember> => {
  const membership = await ServerMemberModel.findOne<IServerMember>({
    server: serverId,
    user: userId,
  });

  if (!membership) throw ApiError.forbidden(ERROR_MESSAGES.NOT_SERVER_MEMBER);

  if (!requiredRoles.includes(membership.role)) {
    throw ApiError.forbidden(`Only ${requiredRoles.join(", ")} can perform this action.`);
  }

  return membership;
};

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { serverId } = req.params as { serverId: string };
  const { name, position } = req.body as { name: string; position?: number };
  const userId = validateObjectId(req.user!._id);

  await checkMemberPermission(serverId, userId, ["owner", "admin"]);

  const server = await ServerModel.findById(serverId);
  if (!server) throw ApiError.notFound(ERROR_MESSAGES.SERVER_NOT_FOUND);

  const highestCategory = await ChannelCategoryModel.findOne({ server: serverId })
    .sort({ position: -1 })
    .lean<IChannelCategory>();
  const newPosition = position ?? (highestCategory ? highestCategory.position + 1 : 0);

  const category = await ChannelCategoryModel.create({
    name,
    server: serverId,
    position: newPosition,
  });

  await pubClient.del(`server:${serverId}`);

  return sendCreated(res, category, SUCCESS_MESSAGES.CATEGORY_CREATED);
});

export const getServerCategories = asyncHandler(async (req: Request, res: Response) => {
  const { serverId } = req.params as { serverId: string };
  const userId = validateObjectId(req.user!._id);

  const isMember = await ServerMemberModel.exists({ server: serverId, user: userId });
  if (!isMember) throw ApiError.forbidden(ERROR_MESSAGES.NOT_SERVER_MEMBER);

  const categories = await ChannelCategoryModel.find({ server: serverId })
    .sort({ position: 1 })
    .lean<IChannelCategory[]>();

  const channels = await ChannelModel.find({ server: serverId })
    .sort({ position: 1 })
    .lean();

  const categorized = categories.map((cat) => ({
    ...cat,
    channels: channels.filter((ch) => ch.category?.toString() === cat._id.toString()),
  }));

  const uncategorized = channels.filter((ch) => !ch.category);

  return sendSuccess(res, { categories: categorized, uncategorized });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId } = req.params as { categoryId: string };
  const { name, position } = req.body as { name?: string; position?: number };
  const userId = validateObjectId(req.user!._id);

  const category = await ChannelCategoryModel.findById<IChannelCategory>(categoryId);
  if (!category) throw ApiError.notFound(ERROR_MESSAGES.CATEGORY_NOT_FOUND);

  await checkMemberPermission(category.server.toString(), userId, ["owner", "admin"]);

  if (name) category.name = name;
  if (position !== undefined) category.position = position;

  await category.save();
  await pubClient.del(`server:${category.server}`);

  const updated = await ChannelCategoryModel.findById(categoryId).lean<IChannelCategory>();
  return sendSuccess(res, updated, SUCCESS_MESSAGES.CATEGORY_UPDATED);
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId } = req.params as { categoryId: string };
  const userId = validateObjectId(req.user!._id);

  const category = await ChannelCategoryModel.findById<IChannelCategory>(categoryId);
  if (!category) throw ApiError.notFound(ERROR_MESSAGES.CATEGORY_NOT_FOUND);

  await checkMemberPermission(category.server.toString(), userId, ["owner", "admin"]);

  await ChannelModel.updateMany(
    { category: categoryId },
    { $unset: { category: 1 } }
  );

  await category.deleteOne();
  await pubClient.del(`server:${category.server}`);

  return sendSuccess(res, null, SUCCESS_MESSAGES.CATEGORY_DELETED);
});

export const reorderCategories = asyncHandler(async (req: Request, res: Response) => {
  const { serverId } = req.params as { serverId: string };
  const { categoryOrder } = req.body as { categoryOrder: Array<{ categoryId: string; position: number }> };
  const userId = validateObjectId(req.user!._id);

  await checkMemberPermission(serverId, userId, ["owner", "admin"]);

  if (!Array.isArray(categoryOrder) || categoryOrder.length === 0) {
    throw ApiError.badRequest("categoryOrder must be a non-empty array.");
  }

  await ChannelCategoryModel.bulkWrite(
    categoryOrder.map(({ categoryId, position }) => ({
      updateOne: {
        filter: { _id: categoryId, server: serverId },
        update: { $set: { position } },
      },
    }))
  );

  const categories = await ChannelCategoryModel.find({ server: serverId })
    .sort({ position: 1 })
    .lean<IChannelCategory[]>();

  await pubClient.del(`server:${serverId}`);

  return sendSuccess(res, categories, SUCCESS_MESSAGES.CATEGORIES_REORDERED);
});

// export default {
//   createCategory,
//   getServerCategories,
//   updateCategory,
//   deleteCategory,
//   reorderCategories,
// };