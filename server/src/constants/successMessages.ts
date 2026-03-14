// All user-facing success messages in one place.

export const SUCCESS_MESSAGES = {

    // ── Auth ─────────────────────────────────────────────────────────────────────
    REGISTER_SUCCESS: "Account created successfully.",
    LOGIN_SUCCESS: "Logged in successfully.",
    LOGOUT_SUCCESS: "Logged out successfully.",
    AUTH_STATUS_SUCCESS: "Authentication status fetched successfully.",
    TOKEN_REFRESHED: "Token refreshed successfully.",

    // ── Password ─────────────────────────────────────────────────────────────────
    PASSWORD_CHANGED: "Password changed successfully.",
    PASSWORD_RESET_SENT: "Password reset instructions have been sent to your email.",
    PASSWORD_RESET_SUCCESS: "Password has been reset successfully. Please log in.",

    // ── OTP ──────────────────────────────────────────────────────────────────────
    OTP_EMAIL_SENT: "Verification code sent to your email. It expires in 10 minutes.",
    OTP_PHONE_SENT: "Verification code sent via SMS. It expires in 10 minutes.",
    EMAIL_VERIFIED: "Email address verified successfully.",
    PHONE_VERIFIED: "Phone number verified successfully.",

    // ── User ─────────────────────────────────────────────────────────────────────
    USER_CREATED: "User created successfully.",
    USER_UPDATED: "User updated successfully.",
    USER_DELETED: "Account deleted successfully.",
    USERS_FETCHED: "Users fetched successfully.",
    GET_PROFILE_SUCCESS: "Profile fetched successfully.",
    PROFILE_UPDATED: "Profile updated successfully.",
    AVATAR_UPDATED: "Avatar updated successfully.",
    AVATAR_DELETED: "Avatar removed successfully.",

    // ── Friends ──────────────────────────────────────────────────────────────────
    FRIEND_REQUEST_SENT: "Friend request sent successfully.",
    FRIEND_REQUEST_ACCEPTED: "Friend request accepted.",
    FRIEND_REQUEST_DECLINED: "Friend request declined.",
    FRIEND_REQUEST_CANCELLED: "Friend request cancelled.",
    FRIEND_REMOVED: "Friend removed successfully.",
    FRIENDS_FETCHED: "Friends fetched successfully.",
    FRIEND_REQUESTS_FETCHED: "Friend requests fetched successfully.",
    FRIEND_ADDED: "Friend added successfully.",

    // ── Server ───────────────────────────────────────────────────────────────────
    SERVER_CREATED: "Server created successfully.",
    SERVER_UPDATED: "Server updated successfully.",
    SERVER_DELETED: "Server deleted successfully.",
    SERVER_FETCHED: "Server fetched successfully.",
    SERVERS_FETCHED: "Servers fetched successfully.",
    SERVERS_FETCHED_FOR_USER: "Your servers fetched successfully.",
    SERVER_JOINED: "Joined server successfully.",
    SERVER_LEFT: "Left server successfully.",
    SERVER_MEMBER_KICKED: "Member removed from server successfully.",
    SERVER_MEMBER_BANNED: "Member banned from server successfully.",
    SERVER_MEMBER_UNBANNED: "Member unbanned successfully.",
    SERVER_MEMBERS_FETCHED: "Server members fetched successfully.",
    OWNERSHIP_TRANSFERRED: "Server ownership transferred successfully.",
    MEMBER_ROLE_UPDATED: "Member role updated successfully.",

    // ── Channel ──────────────────────────────────────────────────────────────────
    CHANNEL_CREATED: "Channel created successfully.",
    CHANNEL_UPDATED: "Channel updated successfully.",
    CHANNEL_DELETED: "Channel deleted successfully.",
    CHANNEL_FETCHED: "Channel fetched successfully.",
    CHANNELS_FETCHED: "Channels fetched successfully.",
    CHANNELS_REORDERED: "Channels reordered successfully.",

    // ── Role ─────────────────────────────────────────────────────────────────────
    ROLE_CREATED: "Role created successfully.",
    ROLE_UPDATED: "Role updated successfully.",
    ROLE_DELETED: "Role deleted successfully.",
    ROLE_FETCHED: "Role fetched successfully.",
    ROLES_FETCHED: "Roles fetched successfully.",
    ROLES_REORDERED: "Roles reordered successfully.",
    ROLE_ASSIGNED: "Role assigned to member successfully.",
    ROLE_REMOVED: "Role removed from member successfully.",

    // ── Messages ─────────────────────────────────────────────────────────────────
    MESSAGE_SENT: "Message sent successfully.",
    MESSAGE_UPDATED: "Message updated successfully.",
    MESSAGE_DELETED: "Message deleted successfully.",
    MESSAGES_FETCHED: "Messages fetched successfully.",
    MESSAGE_PINNED: "Message pinned successfully.",
    MESSAGE_UNPINNED: "Message unpinned successfully.",
    REACTION_ADDED: "Reaction added successfully.",
    REACTION_REMOVED: "Reaction removed successfully.",

    // ── Direct Messages ──────────────────────────────────────────────────────────
    DM_SENT: "Direct message sent successfully.",
    DM_UPDATED: "Direct message updated successfully.",
    DM_DELETED: "Direct message deleted successfully.",
    DM_FETCHED: "Direct messages fetched successfully.",
    DM_READ: "Messages marked as read.",
    UNREAD_COUNT_FETCHED: "Unread message count fetched successfully.",
    CONVERSATION_DELETED: "Conversation deleted successfully.",

    // ── Invites ──────────────────────────────────────────────────────────────────
    INVITE_CREATED: "Invite link created successfully.",
    INVITE_FETCHED: "Invite fetched successfully.",
    INVITES_FETCHED: "Invites fetched successfully.",
    INVITE_DELETED: "Invite deleted successfully.",

} as const;

export type SuccessMessage = (typeof SUCCESS_MESSAGES)[keyof typeof SUCCESS_MESSAGES];