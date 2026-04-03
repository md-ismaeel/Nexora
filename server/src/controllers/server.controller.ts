import type { Request, Response } from "express";
import type { Types } from "mongoose";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiError } from "@/utils/ApiError";
import { sendSuccess, sendCreated } from "@/utils/response";
import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { SUCCESS_MESSAGES } from "@/constants/successMessages";
import type { IServer, IServerMember } from "@/types/models";
import { ServerModel } from "@/models/server.model";
import { ChannelModel } from "@/models/channel.model";
import { ServerMemberModel } from "@/models/serverMember.model";
import { MessageModel } from "@/models/message.model";
import { RoleModel } from "@/models/role.model";
import { InviteModel } from "@/models/invite.model";
import { pubClient } from "@/config/redis.config";
import { validateObjectId } from "@/utils/validateObjId";

// ─── Create a new server
export const createServer = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, icon, isPublic } = req.body as {
    name: string;
    description?: string;
    icon?: string;
    isPublic?: boolean;
  };
  const userId = validateObjectId(req.user!._id);

  const existingServer = await ServerModel.findOne({ name, owner: userId });
  if (existingServer) {
    throw ApiError.conflict("A server with this name already exists.");
  }

  const server = await ServerModel.create({
    name,
    description,
    icon,
    isPublic: isPublic ?? false,
    owner: userId,
  });

  // Create the owner's ServerMember entry
  const ownerMember = await ServerMemberModel.create({
    user: userId,
    server: server._id,
    role: "owner",
  });

  // IServer.members: Types.ObjectId[]
  server.members.push(ownerMember._id);

  // Create default channels in parallel
  const [generalChannel, voiceChannel] = await Promise.all([
    ChannelModel.create({ name: "general", type: "text", server: server._id, position: 0 }),
    ChannelModel.create({ name: "General Voice", type: "voice", server: server._id, position: 1 }),
  ]);

  // IServer.channels: Types.ObjectId[]
  server.channels.push(generalChannel._id, voiceChannel._id);
  await server.save();

  await pubClient.setex(`server:${server._id}`, 3600, JSON.stringify(server));

  const populatedServer = await ServerModel.findById(server._id)
    .populate("owner", "username avatar")
    .populate("channels")
    .populate({ path: "members", populate: { path: "user", select: "username avatar status" } });

  return sendCreated(res, populatedServer, SUCCESS_MESSAGES.SERVER_CREATED);
});

// ─── Get all servers for the current user
export const getUserServers = asyncHandler(async (req: Request, res: Response) => {
  const userId = validateObjectId(req.user!._id);

  const memberships = await ServerMemberModel.find({ user: userId }).select("server");
  const serverIds = memberships.map((m) => m.server);

  const servers = await ServerModel.find({ _id: { $in: serverIds } })
    .populate("owner", "username avatar")
    .populate("channels")
    .sort({ createdAt: -1 });

  return sendSuccess(res, servers, SUCCESS_MESSAGES.SERVERS_FETCHED_FOR_USER);
});

// ─── Get server by ID
export const getServer = asyncHandler(async (req: Request, res: Response) => {
  const { serverId } = req.params as { serverId: string };
  const userId = validateObjectId(req.user!._id);

  const cached = await pubClient.get(`server:${serverId}`);
  if (cached) {
    const server = JSON.parse(cached) as IServer;
    const isMember = await ServerMemberModel.exists({ server: serverId, user: userId });
    if (!isMember && !server.isPublic) {
      throw ApiError.forbidden(ERROR_MESSAGES.NOT_SERVER_MEMBER);
    }
    return sendSuccess(res, server);
  }

  const server = await ServerModel.findById(serverId)
    .populate("owner", "username avatar")
    .populate("channels")
    .populate({ path: "members", populate: { path: "user", select: "username avatar status" } });

  if (!server) throw ApiError.notFound(ERROR_MESSAGES.SERVER_NOT_FOUND);

  const isMember = await ServerMemberModel.exists({ server: serverId, user: userId });
  if (!isMember && !server.isPublic) {
    throw ApiError.forbidden(ERROR_MESSAGES.NOT_SERVER_MEMBER);
  }

  await pubClient.setex(`server:${serverId}`, 3600, JSON.stringify(server));

  return sendSuccess(res, server);
});

// ─── Update server
export const updateServer = asyncHandler(async (req: Request, res: Response) => {
  const { serverId } = req.params as { serverId: string };
  const { name, description, icon, banner, isPublic } = req.body as {
    name?: string;
    description?: string;
    icon?: string | null;
    banner?: string | null;
    isPublic?: boolean;
  };
  const userId = validateObjectId(req.user!._id);

  const server = await ServerModel.findById<IServer>(serverId);
  if (!server) throw ApiError.notFound(ERROR_MESSAGES.SERVER_NOT_FOUND);

  // IServer.owner: Types.ObjectId
  if (server.owner.toString() !== userId) {
    throw ApiError.forbidden(ERROR_MESSAGES.NOT_SERVER_OWNER);
  }

  if (name) server.name = name;
  if (description !== undefined) server.description = description;
  if (icon !== undefined) server.icon = icon ?? undefined;
  if (banner !== undefined) server.banner = banner ?? undefined;
  if (isPublic !== undefined) server.isPublic = isPublic;

  await server.save();
  await pubClient.del(`server:${serverId}`);

  const updatedServer = await ServerModel.findById(serverId)
    .populate("owner", "username avatar")
    .populate("channels");

  return sendSuccess(res, updatedServer, SUCCESS_MESSAGES.SERVER_UPDATED);
});

// ─── Delete server
// FIX: original only deleted channels and members. Messages, roles, and invites
// were left as orphans in the DB. Now cascades all related collections.
export const deleteServer = asyncHandler(async (req: Request, res: Response) => {
  const { serverId } = req.params as { serverId: string };
  const userId = validateObjectId(req.user!._id);

  const server = await ServerModel.findById<IServer>(serverId);
  if (!server) throw ApiError.notFound(ERROR_MESSAGES.SERVER_NOT_FOUND);

  // IServer.owner: Types.ObjectId
  if (server.owner.toString() !== userId) {
    throw ApiError.forbidden(ERROR_MESSAGES.NOT_SERVER_OWNER);
  }

  // Cascade delete all server-related data in parallel
  await Promise.all([
    ChannelModel.deleteMany({ server: serverId }),
    ServerMemberModel.deleteMany({ server: serverId }),
    MessageModel.deleteMany({ server: serverId }),
    RoleModel.deleteMany({ server: serverId }),
    InviteModel.deleteMany({ server: serverId }),
  ]);

  await server.deleteOne();
  await pubClient.del(`server:${serverId}`);

  return sendSuccess(res, null, SUCCESS_MESSAGES.SERVER_DELETED);
});

// ─── Leave server
export const leaveServer = asyncHandler(async (req: Request, res: Response) => {
  const { serverId } = req.params as { serverId: string };
  const userId = validateObjectId(req.user!._id);

  const server = await ServerModel.findById<IServer>(serverId);
  if (!server) throw ApiError.notFound(ERROR_MESSAGES.SERVER_NOT_FOUND);

  // IServer.owner: Types.ObjectId — owner cannot leave
  if (server.owner.toString() === userId) {
    throw ApiError.badRequest(ERROR_MESSAGES.SERVER_OWNER_CANNOT_LEAVE);
  }

  const membership = await ServerMemberModel.findOneAndDelete<IServerMember>({
    server: serverId,
    user: userId,
  });
  if (!membership) throw ApiError.forbidden(ERROR_MESSAGES.NOT_SERVER_MEMBER);

  // IServer.members holds ServerMember _ids — filter by membership._id
  server.members = server.members.filter(
    (m) => m.toString() !== membership._id.toString(),
  );
  await server.save();
  await pubClient.del(`server:${serverId}`);

  return sendSuccess(res, null, SUCCESS_MESSAGES.SERVER_LEFT);
});

// ─── Update member role
export const updateMemberRole = asyncHandler(async (req: Request, res: Response) => {
  const { serverId, memberId } = req.params as { serverId: string; memberId: string };
  // IServerMember.role: "owner" | "admin" | "moderator" | "member"
  const { role } = req.body as { role: Exclude<IServerMember["role"], "owner"> };
  const userId = validateObjectId(req.user!._id);

  const server = await ServerModel.findById(serverId);
  if (!server) throw ApiError.notFound(ERROR_MESSAGES.SERVER_NOT_FOUND);

  const requester = await ServerMemberModel.findOne<IServerMember>({
    server: serverId,
    user: userId,
  });
  if (!requester || !["owner", "admin"].includes(requester.role)) {
    throw ApiError.forbidden("Only owners and admins can update member roles.");
  }

  const target = await ServerMemberModel.findOne<IServerMember>({
    server: serverId,
    user: memberId,
  });
  if (!target) throw ApiError.notFound("Member not found in this server.");

  if (target.role === "owner") throw ApiError.forbidden("Cannot change the owner's role.");

  target.role = role;
  await target.save();

  await pubClient.del(`server:${serverId}`);

  const updatedMember = await ServerMemberModel.findById(target._id).populate(
    "user",
    "username avatar status",
  );

  return sendSuccess(res, updatedMember, SUCCESS_MESSAGES.MEMBER_ROLE_UPDATED);
});

// ─── Kick member from server
export const kickMember = asyncHandler(async (req: Request, res: Response) => {
  const { serverId, memberId } = req.params as { serverId: string; memberId: string };
  const userId = validateObjectId(req.user!._id);

  const server = await ServerModel.findById<IServer>(serverId);
  if (!server) throw ApiError.notFound(ERROR_MESSAGES.SERVER_NOT_FOUND);

  const requester = await ServerMemberModel.findOne<IServerMember>({
    server: serverId,
    user: userId,
  });
  if (!requester || !["owner", "admin"].includes(requester.role)) {
    throw ApiError.forbidden("Only owners and admins can kick members.");
  }

  const target = await ServerMemberModel.findOne<IServerMember>({
    server: serverId,
    user: memberId,
  });
  if (!target) throw ApiError.notFound("Member not found in this server.");

  if (target.role === "owner") throw ApiError.forbidden("Cannot kick the server owner.");

  await ServerMemberModel.findByIdAndDelete(target._id);

  // IServer.members: Types.ObjectId[] — remove by target._id
  server.members = server.members.filter(
    (m) => m.toString() !== target._id.toString(),
  );
  await server.save();
  await pubClient.del(`server:${serverId}`);

  return sendSuccess(res, null, SUCCESS_MESSAGES.SERVER_MEMBER_KICKED);
});

// ─── Get server members
export const getServerMembers = asyncHandler(async (req: Request, res: Response) => {
  const { serverId } = req.params as { serverId: string };
  const userId = validateObjectId(req.user!._id);

  const isMember = await ServerMemberModel.exists({ server: serverId, user: userId });
  if (!isMember) throw ApiError.forbidden(ERROR_MESSAGES.NOT_SERVER_MEMBER);

  const members = await ServerMemberModel.find({ server: serverId })
    .populate("user", "username avatar status lastSeen customStatus")
    .sort({ joinedAt: 1 });

  return sendSuccess(res, members, SUCCESS_MESSAGES.SERVER_MEMBERS_FETCHED);
});

// ─── Ban member from server
export const banMember = asyncHandler(async (req: Request, res: Response) => {
  const { serverId, memberId } = req.params as { serverId: string; memberId: string };
  const { reason } = req.body as { reason?: string };
  const userId = validateObjectId(req.user!._id);

  const server = await ServerModel.findById<IServer>(serverId);
  if (!server) throw ApiError.notFound(ERROR_MESSAGES.SERVER_NOT_FOUND);

  const requester = await ServerMemberModel.findOne<IServerMember>({
    server: serverId,
    user: userId,
  });
  if (!requester || !["owner", "admin"].includes(requester.role)) {
    throw ApiError.forbidden("Only owners and admins can ban members.");
  }

  const target = await ServerMemberModel.findOne<IServerMember>({
    server: serverId,
    user: memberId,
  });
  if (!target) throw ApiError.notFound("Member not found in this server.");

  if (target.role === "owner") throw ApiError.forbidden("Cannot ban the server owner.");

  const existingBan = server.bannedUsers.find(b => b.user.toString() === memberId);
  if (existingBan) throw ApiError.badRequest("User is already banned.");

  server.bannedUsers.push({
    user: memberId as unknown as Types.ObjectId,
    bannedBy: userId as unknown as Types.ObjectId,
    reason: reason || "",
    bannedAt: new Date(),
  });

  await server.save();
  await ServerMemberModel.findByIdAndDelete(target._id);
  server.members = server.members.filter(m => m.toString() !== target._id.toString());
  await server.save();
  await pubClient.del(`server:${serverId}`);

  return sendSuccess(res, null, SUCCESS_MESSAGES.SERVER_MEMBER_BANNED);
});

// ─── Unban member from server
export const unbanMember = asyncHandler(async (req: Request, res: Response) => {
  const { serverId, userId: targetUserId } = req.params as { serverId: string; userId: string };
  const userId = validateObjectId(req.user!._id);

  const server = await ServerModel.findById<IServer>(serverId);
  if (!server) throw ApiError.notFound(ERROR_MESSAGES.SERVER_NOT_FOUND);

  const requester = await ServerMemberModel.findOne<IServerMember>({
    server: serverId,
    user: userId,
  });
  if (!requester || !["owner", "admin"].includes(requester.role)) {
    throw ApiError.forbidden("Only owners and admins can unban members.");
  }

  const banIndex = server.bannedUsers.findIndex(b => b.user.toString() === targetUserId);
  if (banIndex === -1) throw ApiError.notFound("User is not banned from this server.");

  server.bannedUsers.splice(banIndex, 1);
  await server.save();
  await pubClient.del(`server:${serverId}`);

  return sendSuccess(res, null, SUCCESS_MESSAGES.SERVER_MEMBER_UNBANNED);
});

// ─── Get server bans
export const getServerBans = asyncHandler(async (req: Request, res: Response) => {
  const { serverId } = req.params as { serverId: string };
  const userId = validateObjectId(req.user!._id);

  const server = await ServerModel.findById<IServer>(serverId);
  if (!server) throw ApiError.notFound(ERROR_MESSAGES.SERVER_NOT_FOUND);

  const requester = await ServerMemberModel.findOne<IServerMember>({
    server: serverId,
    user: userId,
  });
  if (!requester || !["owner", "admin", "moderator"].includes(requester.role)) {
    throw ApiError.forbidden("Only members with moderation permissions can view bans.");
  }

  const bansWithUsers = await Promise.all(
    server.bannedUsers.map(async (ban) => {
      const user = await import("@/models/user.model").then(m => 
        m.UserModel.findById(ban.user).select("username avatar").lean()
      );
      return {
        user: user || { _id: ban.user, username: "Unknown User" },
        bannedBy: ban.bannedBy,
        reason: ban.reason,
        bannedAt: ban.bannedAt,
      };
    })
  );

  return sendSuccess(res, bansWithUsers);
});

// ─── Get public servers for discovery
export const getPublicServers = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const page = parseInt(req.query.page as string) || 1;
  const skip = (page - 1) * limit;

  const servers = await ServerModel.find({ isPublic: true })
    .select("name description icon banner memberCount createdAt")
    .sort({ memberCount: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await ServerModel.countDocuments({ isPublic: true });

  return sendSuccess(res, {
    servers,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
});

// ─── Search public servers
export const searchPublicServers = asyncHandler(async (req: Request, res: Response) => {
  const { q, limit, page } = req.query as {
    q?: string;
    limit?: string;
    page?: string;
  };

  const parsedLimit = limit ? parseInt(limit) : 20;
  const parsedPage = page ? parseInt(page) : 1;
  const skip = (parsedPage - 1) * parsedLimit;

  const query: Record<string, unknown> = { isPublic: true };
  if (q) {
    query.$or = [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }

  const servers = await ServerModel.find(query)
    .select("name description icon banner memberCount createdAt")
    .sort({ memberCount: -1 })
    .skip(skip)
    .limit(parsedLimit)
    .lean();

  const total = await ServerModel.countDocuments(query);

  return sendSuccess(res, {
    servers,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      pages: Math.ceil(total / parsedLimit),
    },
  });
});

export default {
  createServer,
  getUserServers,
  getServer,
  updateServer,
  deleteServer,
  leaveServer,
  updateMemberRole,
  kickMember,
  getServerMembers,
  banMember,
  unbanMember,
  getServerBans,
  getPublicServers,
  searchPublicServers,
};