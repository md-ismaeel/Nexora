import type { Request, Response } from "express";
import type { Types } from "mongoose";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiError } from "@/utils/ApiError";
import { sendSuccess } from "@/utils/response";
import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { SUCCESS_MESSAGES } from "@/constants/successMessages";
import type { IUser } from "@/types/models";
import { UserModel } from "@/models/user.model";
import { ServerMemberModel } from "@/models/serverMember.model";
import { ServerModel } from "@/models/server.model";
import { pubClient } from "@/config/redis.config";
import { hashPassword, comparePassword } from "@/utils/bcrypt";
import { blacklistToken, deleteRefreshToken } from "@/utils/redis";
import { emitToUser } from "@/socket/socketHandler";
import { validateObjectId } from "@/utils/validateObjId";
import { uploadAvatarToCloud } from "@/services/cloudinary.service";

// ─── Cache helpers
const CACHE_TTL = {
  USER: 1800,        // 30 minutes — full profile (getMe)
  USER_PUBLIC: 1800, // 30 minutes — public profile (getUserById)
  USERS_LIST: 600,   // 10 minutes
  FRIENDS: 900,      // 15 minutes
  BLOCKED: 900,      // 15 minutes
} as const;

const getCacheKey = {
  user: (userId: string) => `user:${userId}`,
  // FIX: separated public profile cache key from full profile cache key.
  // Previously both getMe and getUserById used `user:{id}` — so a visitor
  // fetching another user's public profile could receive the full profile
  // (with friends list) from cache if the owner had called getMe first.
  userPublic: (userId: string) => `user:${userId}:public`,
  userServers: (userId: string) => `user:${userId}:servers`,
  userFriends: (userId: string) => `user:${userId}:friends`,
  userBlocked: (userId: string) => `user:${userId}:blocked`,
  searchResults: (query: string, page: number, limit: number) =>
    `search:users:${query}:${page}:${limit}`,
};

const invalidateUserCache = async (userId: string): Promise<void> => {
  const keys = [
    getCacheKey.user(userId),
    getCacheKey.userPublic(userId),
    getCacheKey.userServers(userId),
    getCacheKey.userFriends(userId),
    getCacheKey.userBlocked(userId),
  ];
  await pubClient.del(...keys);

  const searchKeys = await pubClient.keys("search:users:*");
  if (searchKeys.length > 0) await pubClient.del(...searchKeys);
};

// ─── Extract token from request (cookie or Authorization header)
const extractToken = (req: Request): string | undefined => {
  const authHeader = req.headers.authorization;
  return (
    (req.cookies as Record<string, string | undefined>)?.["token"] ??
    (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined)
  );
};

// ─── Get current user profile
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = validateObjectId(req.user!._id);
  const cacheKey = getCacheKey.user(userId);

  const cached = await pubClient.get(cacheKey);
  if (cached) return sendSuccess(res, JSON.parse(cached));

  const user = await UserModel.findById<IUser>(userId)
    .select("-password")
    .populate("friends", "username avatar status customStatus lastSeen")
    .lean();

  if (!user) throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);

  await pubClient.setex(cacheKey, CACHE_TTL.USER, JSON.stringify(user));

  return sendSuccess(res, user, SUCCESS_MESSAGES.GET_PROFILE_SUCCESS);
});

// ─── Update current user profile
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = validateObjectId(req.user!._id);
  const { name, username, bio, avatar } = req.body as {
    name?: string;
    username?: string;
    bio?: string;
    avatar?: string;
  };

  const user = await UserModel.findById<IUser>(userId);
  if (!user) throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);

  if (username && username !== user.username) {
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) throw ApiError.conflict(ERROR_MESSAGES.USERNAME_TAKEN);
    user.username = username;
  }

  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();
  await invalidateUserCache(userId);

  emitToUser(userId, "user:profileUpdated", {
    userId,
    updates: { name, username, bio, avatar },
    timestamp: new Date(),
  });

  const updatedUser = await UserModel.findById(userId).select("-password");

  return sendSuccess(res, updatedUser, SUCCESS_MESSAGES.PROFILE_UPDATED);
});

// ─── Upload user avatar
export const uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
  const userId = validateObjectId(req.user!._id);

  if (!req.file) throw ApiError.badRequest("No file uploaded.");

  const uploadResult = await uploadAvatarToCloud(req.file.buffer, userId);

  const user = await UserModel.findByIdAndUpdate<IUser>(
    userId,
    {
      avatar: uploadResult.url,
      avatarPublicId: uploadResult.publicId,
    },
    { new: true },
  ).select("-password");

  if (!user) throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);

  await invalidateUserCache(userId);

  emitToUser(userId, "user:avatarUpdated", {
    userId,
    avatar: uploadResult.url,
    timestamp: new Date(),
  });

  return sendSuccess(res, { avatar: uploadResult.url }, SUCCESS_MESSAGES.AVATAR_UPDATED);
});

// ─── Change user password
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = validateObjectId(req.user!._id);
  const { currentPassword, newPassword } = req.body as {
    currentPassword: string;
    newPassword: string;
  };

  // IUser.password is select:false — must use +password
  const user = await UserModel.findById<IUser>(userId).select("+password");
  if (!user) throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);

  if (user.provider !== "email") {
    throw ApiError.badRequest("Cannot change password for OAuth accounts.");
  }

  if (!user.password) {
    throw ApiError.badRequest("No password set for this account.");
  }

  const isPasswordValid = await comparePassword(currentPassword, user.password);
  if (!isPasswordValid) throw ApiError.unauthorized(ERROR_MESSAGES.INCORRECT_PASSWORD);

  if (currentPassword === newPassword) {
    throw ApiError.badRequest(ERROR_MESSAGES.PASSWORD_SAME);
  }

  user.password = await hashPassword(newPassword);
  await user.save();

  return sendSuccess(res, null, SUCCESS_MESSAGES.PASSWORD_CHANGED);
});

// ─── Delete current user account
// FIX: original did not blacklist the JWT or delete the refresh token, meaning
// a deleted user's access token stayed valid for 7 days. Now invalidates all
// active tokens before deletion, matching auth.controller.deleteAccount.
export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  const userId = validateObjectId(req.user!._id);

  // Invalidate tokens before touching the DB
  const token = extractToken(req);
  await Promise.all([
    token ? blacklistToken(token, 604_800) : Promise.resolve(),
    deleteRefreshToken(userId),
  ]);

  // Remove all server memberships
  await ServerMemberModel.deleteMany({ user: userId });

  // For servers this user owns: transfer to an admin/moderator or delete
  const ownedServers = await ServerModel.find({ owner: userId });

  await Promise.all(
    ownedServers.map(async (server) => {
      const nextAdmin = await ServerMemberModel.findOne({
        server: server._id,
        role: { $in: ["admin", "moderator"] },
        user: { $ne: userId },
      });

      if (nextAdmin) {
        server.owner = nextAdmin.user as Types.ObjectId;
        await server.save();
      } else {
        await server.deleteOne();
      }
    }),
  );

  await UserModel.findByIdAndDelete(userId);
  await invalidateUserCache(userId);

  return sendSuccess(res, null, SUCCESS_MESSAGES.USER_DELETED);
});

// ─── Update user status
export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const userId = validateObjectId(req.user!._id);
  const { status, customStatus } = req.body as {
    status: IUser["status"];
    customStatus?: string;
  };

  const user = await UserModel.findByIdAndUpdate<IUser>(
    userId,
    { status, customStatus: customStatus ?? "", lastSeen: new Date() },
    { new: true },
  ).select("-password");

  if (!user) throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);

  await invalidateUserCache(userId);

  // Notify each friend of the status change
  if (user.friends && user.friends.length > 0) {
    user.friends.forEach((friendId) => {
      emitToUser(friendId.toString(), "friend:statusUpdated", {
        userId,
        status,
        customStatus,
        timestamp: new Date(),
      });
    });
  }

  return sendSuccess(res, user, SUCCESS_MESSAGES.USER_UPDATED);
});

// ─── Get user's servers
export const getUserServers = asyncHandler(async (req: Request, res: Response) => {
  const userId = validateObjectId(req.user!._id);
  const cacheKey = getCacheKey.userServers(userId);

  const cached = await pubClient.get(cacheKey);
  if (cached) return sendSuccess(res, JSON.parse(cached));

  const memberships = await ServerMemberModel.find({ user: userId }).select("server");
  const serverIds = memberships.map((m) => m.server);

  const servers = await ServerModel.find({ _id: { $in: serverIds } })
    .populate("owner", "username avatar")
    .select("name icon description isPublic owner createdAt")
    .sort({ createdAt: -1 })
    .lean();

  await pubClient.setex(cacheKey, CACHE_TTL.USER, JSON.stringify(servers));

  return sendSuccess(res, servers, SUCCESS_MESSAGES.SERVERS_FETCHED_FOR_USER);
});

// ─── Get friends list
export const getFriends = asyncHandler(async (req: Request, res: Response) => {
  const userId = validateObjectId(req.user!._id);
  const cacheKey = getCacheKey.userFriends(userId);

  const cached = await pubClient.get(cacheKey);
  if (cached) return sendSuccess(res, JSON.parse(cached));

  const user = await UserModel.findById<IUser>(userId)
    .select("friends")
    .populate("friends", "username avatar status customStatus lastSeen bio")
    .lean();

  if (!user) throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);

  const friends = user.friends ?? [];
  await pubClient.setex(cacheKey, CACHE_TTL.FRIENDS, JSON.stringify(friends));

  return sendSuccess(res, friends, SUCCESS_MESSAGES.FRIENDS_FETCHED);
});

// ─── Add a friend
// NOTE: This directly mutates friends arrays without a FriendRequest check.
// For the full flow (send request → accept → become friends) use the
// /friend-requests endpoints. This endpoint is kept for internal/admin use.
export const addFriend = asyncHandler(async (req: Request, res: Response) => {
  const currentUserId = validateObjectId(req.user!._id);
  const { userId } = req.params as { userId: string };

  if (currentUserId === userId) {
    throw ApiError.badRequest("Cannot add yourself as a friend.");
  }

  const [currentUser, targetUser] = await Promise.all([
    UserModel.findById<IUser>(currentUserId),
    UserModel.findById<IUser>(userId),
  ]);
  if (!currentUser) throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
  if (!targetUser) throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);

  if (currentUser.friends.some((id) => id.toString() === userId)) {
    throw ApiError.badRequest(ERROR_MESSAGES.ALREADY_FRIENDS);
  }

  currentUser.friends.push(userId as unknown as Types.ObjectId);
  targetUser.friends.push(currentUserId as unknown as Types.ObjectId);

  await Promise.all([currentUser.save(), targetUser.save()]);
  await Promise.all([invalidateUserCache(currentUserId), invalidateUserCache(userId)]);

  emitToUser(userId, "friend:added", {
    userId: currentUserId,
    user: {
      _id: currentUser._id,
      username: currentUser.username,
      avatar: currentUser.avatar,
      status: currentUser.status,
    },
    timestamp: new Date(),
  });

  return sendSuccess(res, targetUser, SUCCESS_MESSAGES.FRIEND_ADDED);
});

// ─── Remove a friend
export const removeFriend = asyncHandler(async (req: Request, res: Response) => {
  const currentUserId = validateObjectId(req.user!._id);
  const { userId } = req.params as { userId: string };

  const [currentUser, targetUser] = await Promise.all([
    UserModel.findById<IUser>(currentUserId),
    UserModel.findById<IUser>(userId),
  ]);
  if (!currentUser) throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
  if (!targetUser) throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);

  if (!currentUser.friends.some((id) => id.toString() === userId)) {
    throw ApiError.badRequest(ERROR_MESSAGES.NOT_FRIENDS);
  }

  currentUser.friends = currentUser.friends.filter((id) => id.toString() !== userId);
  targetUser.friends = targetUser.friends.filter((id) => id.toString() !== currentUserId);

  await Promise.all([currentUser.save(), targetUser.save()]);
  await Promise.all([invalidateUserCache(currentUserId), invalidateUserCache(userId)]);

  emitToUser(userId, "friend:removed", { userId: currentUserId, timestamp: new Date() });

  return sendSuccess(res, null, SUCCESS_MESSAGES.FRIEND_REMOVED);
});

// ─── Get list of blocked users
export const getBlockedUsers = asyncHandler(async (req: Request, res: Response) => {
  const userId = validateObjectId(req.user!._id);
  const cacheKey = getCacheKey.userBlocked(userId);

  const cached = await pubClient.get(cacheKey);
  if (cached) return sendSuccess(res, JSON.parse(cached));

  const user = await UserModel.findById<IUser>(userId)
    .select("blockedUsers")
    .populate("blockedUsers", "username avatar")
    .lean();

  if (!user) throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);

  const blockedUsers = user.blockedUsers ?? [];
  await pubClient.setex(cacheKey, CACHE_TTL.BLOCKED, JSON.stringify(blockedUsers));

  return sendSuccess(res, blockedUsers, SUCCESS_MESSAGES.USERS_FETCHED);
});

// ─── Block a user
export const blockUser = asyncHandler(async (req: Request, res: Response) => {
  const currentUserId = validateObjectId(req.user!._id);
  const { userId } = req.params as { userId: string };

  if (currentUserId === userId) throw ApiError.badRequest("Cannot block yourself.");

  const [currentUser, targetUser] = await Promise.all([
    UserModel.findById<IUser>(currentUserId),
    UserModel.findById<IUser>(userId),
  ]);
  if (!currentUser) throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
  if (!targetUser) throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);

  if (!currentUser.blockedUsers) currentUser.blockedUsers = [];

  if (currentUser.blockedUsers.some((id) => id.toString() === userId)) {
    throw ApiError.badRequest("User is already blocked.");
  }

  currentUser.blockedUsers.push(userId as unknown as Types.ObjectId);

  // Remove from friends on both sides automatically
  currentUser.friends = currentUser.friends.filter((id) => id.toString() !== userId);
  targetUser.friends = targetUser.friends.filter((id) => id.toString() !== currentUserId);

  await Promise.all([currentUser.save(), targetUser.save()]);
  await invalidateUserCache(currentUserId);

  return sendSuccess(res, null, "User blocked successfully.");
});

// ─── Unblock a user
export const unblockUser = asyncHandler(async (req: Request, res: Response) => {
  const currentUserId = validateObjectId(req.user!._id);
  const { userId } = req.params as { userId: string };

  const currentUser = await UserModel.findById<IUser>(currentUserId);
  if (!currentUser) throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);

  if (!currentUser.blockedUsers?.some((id) => id.toString() === userId)) {
    throw ApiError.badRequest("User is not blocked.");
  }

  currentUser.blockedUsers = currentUser.blockedUsers.filter(
    (id) => id.toString() !== userId,
  );
  await currentUser.save();
  await invalidateUserCache(currentUserId);

  return sendSuccess(res, null, "User unblocked successfully.");
});

// ─── Search for users by username or name
export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const query = (req.query.q as string | undefined) ?? "";
  const page = parseInt((req.query.page as string) ?? "1", 10);
  const limit = parseInt((req.query.limit as string) ?? "20", 10);

  const cacheKey = getCacheKey.searchResults(query, page, limit);
  const cached = await pubClient.get(cacheKey);
  if (cached) return sendSuccess(res, JSON.parse(cached));

  const skip = (page - 1) * limit;

  // Email excluded from search — searching emails is a privacy risk
  const filter = {
    $or: [
      { username: { $regex: query, $options: "i" } },
      { name: { $regex: query, $options: "i" } },
    ],
    _id: { $ne: req.user!._id },
  };

  const [users, total] = await Promise.all([
    UserModel.find(filter)
      .select("username name avatar status bio")
      .limit(limit)
      .skip(skip)
      .lean<IUser[]>(),
    UserModel.countDocuments(filter),
  ]);

  const result = {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasMore: skip + users.length < total,
    },
  };

  await pubClient.setex(cacheKey, CACHE_TTL.USERS_LIST, JSON.stringify(result));

  return sendSuccess(res, result, SUCCESS_MESSAGES.USERS_FETCHED);
});

// ─── Get user by ID (public profile)
// FIX: uses userPublic cache key (not user) to prevent leaking the full
// profile (with friends list) that getMe stores under the same key.
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const userId = validateObjectId(id);
  const cacheKey = getCacheKey.userPublic(userId);

  const cached = await pubClient.get(cacheKey);
  if (cached) return sendSuccess(res, JSON.parse(cached));

  const user = await UserModel.findById<IUser>(userId)
    .select("username name avatar status customStatus bio lastSeen")
    .lean();

  if (!user) throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);

  await pubClient.setex(cacheKey, CACHE_TTL.USER_PUBLIC, JSON.stringify(user));

  return sendSuccess(res, user, SUCCESS_MESSAGES.GET_PROFILE_SUCCESS);
});

export default {
  getMe,
  updateProfile,
  uploadAvatar,
  changePassword,
  deleteAccount,
  updateStatus,
  getUserServers,
  getFriends,
  addFriend,
  removeFriend,
  getBlockedUsers,
  blockUser,
  unblockUser,
  searchUsers,
  getUserById,
};