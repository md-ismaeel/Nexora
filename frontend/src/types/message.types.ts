import type { IUser } from "@/types/user.types";

// ── Attachment ────────────────────────────────────────────────────────────────

export interface IAttachment {
    url: string;
    filename: string;
    size: number;   // bytes
    type: string;   // MIME type
}

// ── Reaction ──────────────────────────────────────────────────────────────────

export interface IReaction {
    emoji: string;
    users: string[];  // User IDs (populated as IUser[] in some responses)
}

// ── Channel message ───────────────────────────────────────────────────────────

export interface IMessage {
    _id: string;
    content: string;
    author: string | PopulatedUser;   // User ID or populated object
    channel: string;                   // Channel ID
    server: string;                   // Server ID
    attachments: IAttachment[];
    mentions: string[];                 // User IDs
    replyTo?: string | IMessage;        // Message ID or populated message
    isPinned: boolean;
    isEdited: boolean;
    editedAt?: string;
    reactions: IReaction[];
    createdAt: string;
    updatedAt: string;
}

// ── Direct message ────────────────────────────────────────────────────────────

export interface IDirectMessage {
    _id: string;
    content: string;
    sender: string | PopulatedUser;   // User ID or populated object
    receiver: string | PopulatedUser;
    attachments: IAttachment[];
    isRead: boolean;
    isEdited: boolean;
    editedAt?: string;
    createdAt: string;
    updatedAt: string;
}

// ── Friend request ────────────────────────────────────────────────────────────

export interface IFriendRequest {
    _id: string;
    sender: string | PopulatedUser;
    receiver: string | PopulatedUser;
    status: "pending" | "accepted" | "declined";
    createdAt: string;
    updatedAt: string;
}

// ── Populated user (subset of IUser returned in embedded objects) ─────────────

export interface PopulatedUser {
    _id: string;
    name: string;
    username?: string;
    avatar?: string;
    status?: IUser["status"];
    customStatus?: string;
    bio?: string;
}

// ── Type guard ────────────────────────────────────────────────────────────────

/**
 * Returns true when a sender / author / receiver field has been populated
 * by Mongoose (i.e. it is an object with _id) rather than a raw ID string.
 */
export function isPopulatedUser(
    value: string | PopulatedUser | null | undefined,
): value is PopulatedUser {
    return typeof value === "object" && value !== null && "_id" in value;
}