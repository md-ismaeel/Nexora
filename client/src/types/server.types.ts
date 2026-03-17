// ── Server
export interface IServer {
    _id: string;
    name: string;
    description: string;
    icon?: string;
    banner?: string;
    owner: string;
    members: string[];
    channels: string[];
    invites: string[];
    bannedUsers: IBannedUser[];
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IBannedUser {
    user: string;
    bannedBy: string;
    reason?: string;
    bannedAt: string;
}

export interface IServerMember {
    _id: string;
    user: string;
    server: string;
    role: "owner" | "admin" | "moderator" | "member";
    roles: string[];
    nickname?: string;
    isMuted: boolean;
    isDeafened: boolean;
    joinedAt: string;
}

// ── Channel
export type ChannelType = "text" | "voice";

export interface IChannel {
    _id: string;
    name: string;
    type: ChannelType;
    server: string;
    category?: string;
    position: number;
    topic: string;
    isPrivate: boolean;
    allowedRoles: string[];
    createdAt: string;
    updatedAt: string;
}

// ── Role
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
    color: string;
    server: string;
    permissions: IRolePermissions;
    position: number;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

// ── Invite
export interface IInvite {
    _id: string;
    code: string;
    server: string;
    inviter: string;
    maxUses?: number;
    uses: number;
    expiresAt?: string;
    createdAt: string;
    updatedAt: string;
}