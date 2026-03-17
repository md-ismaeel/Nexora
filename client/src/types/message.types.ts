import type { IUserPopulated } from "./user.types";

// ── Attachment
export interface IAttachment {
    url: string;
    filename: string;
    size: number;
    type: string;
    publicId?: string;
    key?: string;
}

// ── Reaction
export interface IReaction {
    emoji: string;
    users: string[];
}

// ── Channel Message
// author is a plain ID when not populated, full object when populated by backend
export interface IMessage {
    _id: string;
    content: string;
    author: string | IUserPopulated;
    channel: string;
    server: string;
    attachments: IAttachment[];
    mentions: string[];
    replyTo?: string | IMessage;
    isPinned: boolean;
    isEdited: boolean;
    editedAt?: string;
    reactions: IReaction[];
    createdAt: string;
    updatedAt: string;
}

// ── Direct Message
export interface IDirectMessage {
    _id: string;
    content: string;
    sender: string | IUserPopulated;
    receiver: string | IUserPopulated;
    attachments: IAttachment[];
    isRead: boolean;
    isEdited: boolean;
    editedAt?: string;
    createdAt: string;
    updatedAt: string;
}

// ── Friend Request
export type FriendRequestStatus = "pending" | "accepted" | "declined";

export interface IFriendRequest {
    _id: string;
    sender: string | IUserPopulated;
    receiver: string | IUserPopulated;
    status: FriendRequestStatus;
    createdAt: string;
    updatedAt: string;
}

// ── Type guards
export const isPopulatedUser = (v: unknown): v is IUserPopulated =>
    typeof v === "object" && v !== null && "_id" in v;