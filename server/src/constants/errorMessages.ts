// All user-facing error messages in one place.
// `as const` gives every value its literal type instead of `string`,
// which helps pattern-match in tests and error handlers.

export const ERROR_MESSAGES = {

  // ── Auth ────────────────────────────────────────────────────────────────────
  UNAUTHORIZED:              "Authentication required. Please log in to continue.",
  FORBIDDEN:                 "You do not have permission to perform this action.",
  INVALID_CREDENTIALS:       "Invalid email or password.",
  TOKEN_EXPIRED:             "Your session has expired. Please log in again.",
  MISSING_FIELDS:            "Required fields are missing.",
  EMAIL_NOT_VERIFIED:        "Please verify your email address before continuing.",
  PHONE_NOT_VERIFIED:        "Please verify your phone number before continuing.",

  // ── Password ─────────────────────────────────────────────────────────────────
  INCORRECT_PASSWORD:        "Current password is incorrect.",
  PASSWORD_SAME:             "New password must be different from your current password.",
  PASSWORD_RESET_FAILED:     "Password reset failed. The link may have expired.",

  // ── User ─────────────────────────────────────────────────────────────────────
  USER_NOT_FOUND:            "User not found.",
  USER_ALREADY_EXISTS:       "An account with this email already exists.",
  USERNAME_TAKEN:            "That username is already taken.",
  PHONE_ALREADY_EXISTS:      "An account with this phone number already exists.",

  // ── OTP ──────────────────────────────────────────────────────────────────────
  OTP_EXPIRED:               "Verification code has expired. Please request a new one.",
  OTP_INVALID:               "Incorrect verification code. Please try again.",
  OTP_LOCKED:                "Too many incorrect attempts. Please request a new verification code.",
  OTP_ALREADY_VERIFIED:      "This contact has already been verified.",

  // ── Email / SMS delivery ─────────────────────────────────────────────────────
  EMAIL_SEND_FAILED:         "Failed to send verification email. Please try again later.",
  SMS_SEND_FAILED:           "Failed to send SMS. Please try again later.",

  // ── Friends ──────────────────────────────────────────────────────────────────
  FRIEND_REQUEST_EXISTS:     "A friend request has already been sent to this user.",
  FRIEND_REQUEST_NOT_FOUND:  "Friend request not found.",
  ALREADY_FRIENDS:           "You are already friends with this user.",
  NOT_FRIENDS:               "You are not friends with this user.",
  CANNOT_ADD_SELF:           "You cannot send a friend request to yourself.",
  CANNOT_DM_SELF:            "You cannot send a direct message to yourself.",

  // ── Server ───────────────────────────────────────────────────────────────────
  SERVER_NOT_FOUND:              "Server not found.",
  SERVER_NAME_REQUIRED:          "Server name is required.",
  NOT_SERVER_MEMBER:             "You are not a member of this server.",
  NOT_SERVER_OWNER:              "Only the server owner can perform this action.",
  NOT_SERVER_ADMIN:              "You do not have admin permissions in this server.",
  SERVER_OWNER_CANNOT_LEAVE:     "The server owner cannot leave without transferring ownership or deleting the server.",
  USER_ALREADY_IN_SERVER:        "You are already a member of this server.",
  USER_BANNED_FROM_SERVER:       "You have been banned from this server.",

  // ── Channel ──────────────────────────────────────────────────────────────────
  CHANNEL_NOT_FOUND:         "Channel not found.",
  CHANNEL_NAME_REQUIRED:     "Channel name is required.",
  NOT_CHANNEL_MEMBER:        "You do not have access to this channel.",

  // ── Role ─────────────────────────────────────────────────────────────────────
  ROLE_NOT_FOUND:            "Role not found.",
  ROLE_NAME_REQUIRED:        "Role name is required.",
  ROLE_ALREADY_EXISTS:       "A role with this name already exists in this server.",
  CANNOT_EDIT_DEFAULT_ROLE:  "The default role cannot be edited or deleted.",

  // ── Category ────────────────────────────────────────────────────────────────
  CATEGORY_NOT_FOUND:        "Category not found.",
  CATEGORY_NAME_REQUIRED:    "Category name is required.",
  CATEGORY_ALREADY_EXISTS:   "A category with this name already exists in this server.",

  // ── Messages ─────────────────────────────────────────────────────────────────
  MESSAGE_NOT_FOUND:         "Message not found.",
  MESSAGE_EMPTY:             "Message cannot be empty.",
  CANNOT_EDIT_MESSAGE:       "You can only edit your own messages.",
  CANNOT_DELETE_MESSAGE:     "You can only delete your own messages.",

  // ── Direct Messages ──────────────────────────────────────────────────────────
  DM_NOT_FOUND:              "Direct message not found.",
  DM_EMPTY:                  "Direct message cannot be empty.",
  CANNOT_EDIT_DM:            "You can only edit your own direct messages.",
  CANNOT_DELETE_DM:          "You can only delete your own direct messages.",

  // ── Invites ──────────────────────────────────────────────────────────────────
  INVITE_NOT_FOUND:          "Invite not found or has expired.",
  INVITE_EXPIRED:            "This invite link has expired.",
  INVITE_MAX_USES:           "This invite link has reached its maximum number of uses.",

  // ── General ──────────────────────────────────────────────────────────────────
  VALIDATION_ERROR:          "Validation failed. Please check your input.",
  INTERNAL_SERVER_ERROR:     "Something went wrong. Please try again later.",
  RESOURCE_NOT_FOUND:        "The requested resource was not found.",
  RATE_LIMIT_EXCEEDED:       "Too many requests. Please slow down and try again.",

} as const;

export type ErrorMessage = (typeof ERROR_MESSAGES)[keyof typeof ERROR_MESSAGES];