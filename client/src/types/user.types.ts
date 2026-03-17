export interface IUserPreferences {
    theme: "light" | "dark" | "auto";
    language: string;
    notifications: {
        email: boolean;
        push: boolean;
        mentions: boolean;
        directMessages: boolean;
    };
}

export interface IUser {
    _id: string;
    name: string;
    email: string;
    username?: string;
    phoneNumber?: string;
    avatar: string;
    provider: "email" | "google" | "github" | "facebook";
    status: "online" | "offline" | "away" | "dnd";
    customStatus: string;
    bio: string;
    friends: string[];
    servers: string[];
    blockedUsers: string[];
    lastSeen: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    preferences?: IUserPreferences;
    createdAt: string;
    updatedAt: string;
}

// Partial user returned in populated fields (e.g. message.author)
export type IUserPopulated = Pick<
    IUser,
    "_id" | "name" | "username" | "avatar" | "status" | "customStatus"
>;