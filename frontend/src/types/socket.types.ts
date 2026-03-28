import type { IMessage, IDirectMessage, IFriendRequest } from "./message.types";
import type { IUser } from "./user.types";
import type { IChannel } from "./server.types";

// ── Events sent BY the server TO the client
export interface ServerToClientEvents {
    // Channel messages
    "message:new": (payload: { message: IMessage }) => void;
    "message:updated": (payload: { message: IMessage }) => void;
    "message:deleted": (payload: { messageId: string; channelId: string }) => void;

    // Direct messages
    "dm:new": (payload: { message: IDirectMessage }) => void;
    "dm:updated": (payload: { message: IDirectMessage }) => void;
    "dm:deleted": (payload: { messageId: string; userId: string }) => void;
    "dm:read": (payload: { senderId: string }) => void;

    // Friend requests
    "friendRequest:received": (payload: { request: IFriendRequest }) => void;
    "friendRequest:accepted": (payload: { request: IFriendRequest; newFriend: Partial<IUser> }) => void;
    "friendRequest:declined": (payload: { request: IFriendRequest }) => void;
    "friendRequest:cancelled": (payload: { requestId: string; senderId: string }) => void;
    "friend:added": (payload: { newFriend: Partial<IUser> }) => void;

    // Presence
    "user:online": (payload: { userId: string }) => void;
    "user:offline": (payload: { userId: string; lastSeen: string }) => void;
    "user:status": (payload: { userId: string; status: IUser["status"] }) => void;

    // Typing
    "typing:start": (payload: { userId: string; channelId: string }) => void;
    "typing:stop": (payload: { userId: string; channelId: string }) => void;

    // Server / channel
    "server:updated": (payload: { serverId: string }) => void;
    "channel:created": (payload: { channel: IChannel }) => void;
    "channel:deleted": (payload: { channelId: string; serverId: string }) => void;
    "member:joined": (payload: { serverId: string; user: Partial<IUser> }) => void;
    "member:left": (payload: { serverId: string; userId: string }) => void;
    "member:kicked": (payload: { serverId: string; userId: string }) => void;
}

// ── Events sent BY the client TO the server
export interface ClientToServerEvents {
    "channel:join": (channelId: string) => void;
    "channel:leave": (channelId: string) => void;
    "typing:start": (payload: { channelId: string }) => void;
    "typing:stop": (payload: { channelId: string }) => void;
}