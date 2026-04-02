import type { IUser } from "./user.types";

// ── Server ────────────────────────────────────────────────────────────────────

export interface IServer {
    _id: string;
    name: string;
    description?: string;
    icon?: string;
    banner?: string;
    owner: string;               // User ID
    members: string[];             // ServerMember IDs
    channels: string[];             // Channel IDs
    invites: string[];             // Invite IDs
    bannedUsers: {
        user: string;
        bannedBy: string;
        reason?: string;
        bannedAt: string;
    }[];
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
}

// ── ServerMember ──────────────────────────────────────────────────────────────


export interface IServerMember {
    _id: string;
    user: string | IUser;         // User ID or populated User object
    server: string;                 // Server ID
    role: "owner" | "admin" | "moderator" | "member";
    roles: string[];               // Role IDs
    nickname?: string;
    isMuted: boolean;
    isDeafened: boolean;
    joinedAt: string;
    createdAt: string;
    updatedAt: string;
}

// ── Channel ───────────────────────────────────────────────────────────────────

export interface IChannel {
    _id: string;
    name: string;
    type: "text" | "voice";
    server: string;             // Server ID
    category?: string;
    position: number;
    topic?: string;
    isPrivate: boolean;
    allowedRoles: string[];           // Role IDs
    createdAt: string;
    updatedAt: string;
}

// ── Invite ────────────────────────────────────────────────────────────────────

export interface IInvite {
    _id: string;
    code: string;
    server: string | IServer;      // Server ID or populated Server object
    inviter: string;                // User ID
    maxUses?: number;
    uses: number;
    expiresAt?: string;
    createdAt: string;
    updatedAt: string;
}

// ── Role ──────────────────────────────────────────────────────────────────────

export interface IRolePermissions {
    administrator: boolean;
    manageServer: boolean;
    manageRoles: boolean;
    manageChannels: boolean;
    kickMembers: boolean;
    banMembers: boolean;
    createInvite: boolean;
    manageMessages: boolean;
    sendMessages: boolean;
    readMessages: boolean;
    mentionEveryone: boolean;
    connect: boolean;
    speak: boolean;
    muteMembers: boolean;
    deafenMembers: boolean;
}

export interface IRole {
    _id: string;
    name: string;
    color: string;               // hex e.g. "#99AAB5"
    server: string;               // Server ID
    permissions: IRolePermissions;
    position: number;
    isDefault: boolean;              // @everyone role
    createdAt: string;
    updatedAt: string;
}

// ── Channel Category ───────────────────────────────────────────────────────

export interface IChannelCategory {
    _id: string;
    name: string;
    server: string;
    position: number;
    createdAt: string;
    updatedAt: string;
}