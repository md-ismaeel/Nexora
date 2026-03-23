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
    username: string;
    phoneNumber?: string;
    avatar?: string;
    avatarPublicId?: string;         // Cloudinary public_id for deletion
    provider: "email" | "google" | "github" | "facebook";
    status: "online" | "offline" | "away" | "dnd";
    customStatus?: string;         // max 128 chars
    bio?: string;         // max 500 chars
    friends: string[];       // User IDs
    servers?: string[];       // Server IDs
    blockedUsers?: string[];       // User IDs
    lastSeen?: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    preferences?: IUserPreferences;
    createdAt: string;
    updatedAt: string;
}