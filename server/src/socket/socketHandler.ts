import { Server, type Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import type http from "http";
import { pubClient, subClient, waitForRedis } from "@/config/redis.config";
import { getEnv } from "@/config/env.config";
import { verifyToken } from "@/utils/jwt.js";
import { UserModel } from "../models/user.model";
import { ServerMemberModel } from "../models/serverMember.model";
import { ChannelModel } from "../models/channel.model";
import type { IUser } from "../types/models";

//  Types
interface AuthenticatedSocket extends Socket {
  userId: string;
  user: Pick<IUser, "username" | "name" | "avatar" | "status"> & {
    _id: string;
  };
}

// Narrow helper — avoids casting in every handler
function isAuthenticated(socket: Socket): socket is AuthenticatedSocket {
  return "userId" in socket;
}

//  Module-level singleton
let io: Server | null = null;

//  Init
export const initSocket = async (httpServer: http.Server): Promise<Server> => {
  console.log("Waiting for Redis to be ready...");
  await waitForRedis();
  console.log("Redis ready — initialising Socket.IO...");

  io = new Server(httpServer, {
    cors: {
      origin: getEnv("CLIENT_URL"),
      credentials: true,
      methods: ["GET", "POST"],
    },
    // Prefer WebSocket, fall back to polling for firewalled clients
    transports: ["websocket", "polling"],
    pingTimeout: 60_000,
    pingInterval: 25_000,
    connectTimeout: 45_000,
    // 1 MB max payload — prevents memory-pressure from large uploads
    maxHttpBufferSize: 1e6,
  });

  io.adapter(createAdapter(pubClient, subClient));
  console.log("Socket.IO Redis adapter attached");

  //  Auth middleware
  io.use(async (socket: Socket, next) => {
    try {
      const token: string | undefined =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.split(" ")[1];

      if (!token) {
        next(new Error("Authentication error: no token provided"));
        return;
      }

      const decoded = verifyToken(token);

      if (!decoded || typeof decoded === "string") {
        next(new Error("Authentication error: invalid token"));
        return;
      }

      const user = await UserModel.findById(decoded.userId)
        .select("-password")
        .lean<IUser>();

      if (!user) {
        next(new Error("Authentication error: user not found"));
        return;
      }

      const authSocket = socket as AuthenticatedSocket;
      authSocket.userId = user._id.toString();
      authSocket.user = {
        _id: user._id.toString(),
        username: user.username ?? user.name,
        name: user.name,
        avatar: user.avatar,
        status: user.status,
      };

      next();
    } catch (err) {
      console.error("Socket auth error:", (err as Error).message);
      next(new Error("Authentication error: invalid token"));
    }
  });

  //  Connection handler
  io.on("connection", (socket: Socket) => {
    if (!isAuthenticated(socket)) return;

    const { userId, user } = socket;
    console.log(`[socket] ${user.username} connected (${socket.id})`);

    // Each user has a personal room for direct targeted events
    void socket.join(`user:${userId}`);

    // Mark online — fire-and-forget, log errors
    UserModel.findByIdAndUpdate(userId, {
      status: "online",
      lastSeen: new Date(),
    }).catch((err: Error) =>
      console.error("Error setting user online:", err.message),
    );

    // ─── Room join helpers
    // FIX: original had no membership validation — any authenticated socket
    // could subscribe to any server or channel room by emitting the event
    // with an arbitrary ID, receiving private real-time events without
    // being a member. Now validates membership before joining.

    socket.on("join:server", async (serverId: string) => {
      try {
        const isMember = await ServerMemberModel.exists({
          server: serverId,
          user: userId,
        });
        if (!isMember) {
          socket.emit("error", {
            event: "join:server",
            message: "You are not a member of this server.",
          });
          return;
        }
        void socket.join(`server:${serverId}`);
      } catch (err) {
        console.error(`[socket] join:server error for ${userId}:`, (err as Error).message);
      }
    });

    socket.on("leave:server", (serverId: string) => {
      void socket.leave(`server:${serverId}`);
    });

    socket.on("join:channel", async (channelId: string) => {
      try {
        const channel = await ChannelModel.findById(channelId).lean();
        if (!channel) {
          socket.emit("error", {
            event: "join:channel",
            message: "Channel not found.",
          });
          return;
        }

        // Verify the user is a member of the channel's parent server
        const membership = await ServerMemberModel.findOne({
          server: channel.server,
          user: userId,
        });

        if (!membership) {
          socket.emit("error", {
            event: "join:channel",
            message: "You are not a member of this server.",
          });
          return;
        }

        // For private channels, also check role membership
        if (channel.isPrivate && !["owner", "admin"].includes(membership.role)) {
          const hasRole =
            channel.allowedRoles.length === 0 ||
            channel.allowedRoles.some((roleId) =>
              membership.roles?.some((r) => r.toString() === roleId.toString()),
            );
          if (!hasRole) {
            socket.emit("error", {
              event: "join:channel",
              message: "You do not have access to this channel.",
            });
            return;
          }
        }

        void socket.join(`channel:${channelId}`);
      } catch (err) {
        console.error(`[socket] join:channel error for ${userId}:`, (err as Error).message);
      }
    });

    socket.on("leave:channel", (channelId: string) => {
      void socket.leave(`channel:${channelId}`);
    });

    // ─── Disconnect
    socket.on("disconnect", async (reason: string) => {
      console.log(`[socket] ${user.username} disconnected (${reason})`);

      try {
        await UserModel.findByIdAndUpdate(userId, {
          status: "offline",
          lastSeen: new Date(),
        });
      } catch (err) {
        console.error("Error setting user offline:", (err as Error).message);
      }
    });
  });

  console.log("Socket.IO initialised successfully");
  return io;
};

// ─── Accessors
export const getIO = (): Server => {
  if (!io) throw new Error("Socket.IO not initialised — call initSocket first");
  return io;
};

// ─── Emit helpers
export const emitToUser = (
  userId: string,
  event: string,
  data: unknown,
): void => {
  io?.to(`user:${userId}`).emit(event, data);
};

export const emitToServer = (
  serverId: string,
  event: string,
  data: unknown,
): void => {
  io?.to(`server:${serverId}`).emit(event, data);
};

export const emitToChannel = (
  channelId: string,
  event: string,
  data: unknown,
): void => {
  io?.to(`channel:${channelId}`).emit(event, data);
};