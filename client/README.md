# Discord App — Frontend Development Guide

> **Base API URL:** `http://localhost:<PORT>/api/v1`
> **Auth:** JWT tokens via cookies + `Authorization: Bearer <token>` header
> **Real-time:** Socket.IO with Redis adapter

---

## Table of Contents

1. [Server Folder Structure](#server-folder-structure)
2. [Data Models & TypeScript Interfaces](#data-models--typescript-interfaces)
3. [API Endpoints Reference](#api-endpoints-reference)
4. [Socket.IO Events](#socketio-events)
5. [Frontend Pages & Routes to Create](#frontend-pages--routes-to-create)
6. [Frontend File & Folder Structure](#frontend-file--folder-structure)
7. [API Service Layer Instructions](#api-service-layer-instructions)
8. [State Management Guidelines](#state-management-guidelines)

---

## Server Folder Structure

```
server/
├── src/
│   ├── server.ts                    # Entry point — Express + HTTP + Socket.IO
│   ├── config/
│   │   ├── db.config.ts             # MongoDB connection (Mongoose)
│   │   ├── env.config.ts            # Environment variable validation & access
│   │   ├── passport.config.ts       # Google/GitHub/Facebook OAuth strategies
│   │   └── redis.config.ts          # Redis pub/sub for Socket.IO adapter
│   ├── constants/
│   │   ├── errorMessages.ts         # All API error message constants
│   │   ├── httpStatus.ts            # HTTP status code constants
│   │   └── successMessages.ts       # All API success message constants
│   ├── controllers/
│   │   ├── auth.controller.ts       # Register, login, OAuth callback, logout, refresh
│   │   ├── channel.controller.ts    # Channel CRUD, reorder
│   │   ├── directMessage.controller.ts  # DM send, edit, delete, conversations
│   │   ├── friendRequest.controller.ts  # Send, accept, decline, cancel requests
│   │   ├── invite.controller.ts     # Create, preview, join, revoke invites
│   │   ├── message.controller.ts    # Channel messages, reactions, pins
│   │   ├── otp.controller.ts        # Email & phone OTP send/verify
│   │   ├── role.controller.ts       # Role CRUD, assign/remove, reorder
│   │   ├── server.controller.ts     # Server CRUD, members, leave/kick
│   │   └── user.controller.ts       # Profile, avatar, friends, blocking, search
│   ├── middlewares/
│   │   ├── auth.middleware.ts        # `authenticated` & `optionalAuth` guards
│   │   ├── errorHandler.ts          # Global error handler
│   │   ├── rateLimit.middleware.ts   # Rate limiters (register, login, OTP)
│   │   ├── upload.middleware.ts      # Multer file upload (avatar)
│   │   └── validate.middleware.ts    # Zod body/params/query validation
│   ├── models/
│   │   ├── user.model.ts            # User schema
│   │   ├── server.model.ts          # Server schema (with bannedUsers sub-doc)
│   │   ├── serverMember.model.ts    # ServerMember schema (user ↔ server join)
│   │   ├── channel.model.ts         # Channel schema (text/voice)
│   │   ├── message.model.ts         # Message schema (with attachments, reactions)
│   │   ├── directMessage.model.ts   # Direct message schema
│   │   ├── friendRequest.model.ts   # Friend request schema
│   │   ├── invite.model.ts          # Server invite schema
│   │   └── role.model.ts            # Role schema (with permissions sub-doc)
│   ├── routes/
│   │   ├── routes.ts                # Main router — mounts all sub-routers
│   │   ├── auth.routes.ts           # /api/v1/auth/*
│   │   ├── user.routes.ts           # /api/v1/users/*
│   │   ├── server.routes.ts         # /api/v1/servers/* (includes channels, members, invites, roles)
│   │   ├── message.routes.ts        # /api/v1/messages/*
│   │   ├── directMessage.routes.ts  # /api/v1/direct-messages/*
│   │   ├── friendRequest.routes.ts  # /api/v1/friend-requests/*
│   │   ├── invite.routes.ts         # /api/v1/invites/*
│   │   ├── role.routes.ts           # /api/v1/roles/*
│   │   └── debug.routes.ts          # /api/v1/debug/* (dev only)
│   ├── services/
│   │   ├── cloudinary.service.ts    # Image upload to Cloudinary
│   │   ├── email.service.ts         # Email sending (OTP, notifications)
│   │   ├── s3.service.ts            # AWS S3 file storage
│   │   └── sms.service.ts           # SMS sending (phone OTP)
│   ├── socket/
│   │   └── socketHandler.ts         # Socket.IO init, auth, room management
│   ├── types/
│   │   ├── models.ts                # All TypeScript interfaces for models
│   │   ├── Controller.types.ts      # Controller type helpers
│   │   ├── express.d.ts             # Express Request augmentation (user, etc.)
│   │   ├── apiError.ts              # API error type
│   │   ├── cloudinary.ts            # Cloudinary types
│   │   └── s3.ts                    # S3 types
│   ├── utils/
│   │   ├── ApiError.ts              # Custom API error class
│   │   ├── asyncHandler.ts          # Async route handler wrapper
│   │   ├── bcrypt.ts                # Password hashing
│   │   ├── jwt.ts                   # JWT sign/verify helpers
│   │   ├── redis.ts                 # Redis cache utilities
│   │   ├── response.ts             # Standardized response helpers
│   │   ├── setTokenCookie.ts        # Set JWT tokens in cookies
│   │   └── validateObjId.ts         # MongoDB ObjectId validation
│   └── validations/
│       ├── auth.validation.ts       # Register, login, profile, password schemas
│       ├── channel.validation.ts    # Channel create/update/reorder schemas
│       ├── common.ts                # Shared schemas (userId, searchUsers, etc.)
│       ├── directMessahe.validation.ts  # DM send/edit schemas
│       ├── friendRequest.validation.ts  # Friend request param schemas
│       ├── invite.validation.ts     # Invite create/code schemas
│       ├── message.validation.ts    # Message send/edit/reaction schemas
│       ├── role.validation.ts       # Role create/update/reorder schemas
│       ├── server.validation.ts     # Server create/update schemas
│       └── serverMember.validation.ts   # Member role update schema
├── .env.example                     # Environment variables template
├── package.json                     # Dependencies & scripts
└── tsconfig.json                    # TypeScript config
```

---

## Data Models & TypeScript Interfaces

### User

```typescript
interface IUser {
  _id: string;
  name: string;
  email: string;
  username: string;
  phoneNumber: string;
  avatar: string;                          // URL (default provided)
  provider: "email" | "google" | "github" | "facebook";
  status: "online" | "offline" | "away" | "dnd";
  customStatus: string;                    // max 128 chars
  bio: string;                             // max 500 chars
  friends: string[];                       // User IDs
  servers: string[];                       // Server IDs
  blockedUsers: string[];                  // User IDs
  lastSeen: Date;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  preferences: {
    theme: "light" | "dark" | "auto";
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      mentions: boolean;
      directMessages: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Server

```typescript
interface IServer {
  _id: string;
  name: string;                            // 2-100 chars
  description: string;                     // max 500 chars
  icon?: string;                           // URL
  banner?: string;                         // URL
  owner: string;                           // User ID
  members: string[];                       // ServerMember IDs
  channels: string[];                      // Channel IDs
  invites: string[];                       // Invite IDs
  bannedUsers: {
    user: string;                          // User ID
    bannedBy: string;                      // User ID
    reason?: string;
    bannedAt: Date;
  }[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### ServerMember

```typescript
interface IServerMember {
  _id: string;
  user: string;                            // User ID
  server: string;                          // Server ID
  role: "owner" | "admin" | "moderator" | "member";
  roles: string[];                         // Role IDs (fine-grained)
  nickname?: string;                       // max 32 chars
  isMuted: boolean;
  isDeafened: boolean;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Channel

```typescript
interface IChannel {
  _id: string;
  name: string;                            // 1-100 chars
  type: "text" | "voice";
  server: string;                          // Server ID
  category?: string;
  position: number;
  topic: string;                           // max 1024 chars
  isPrivate: boolean;
  allowedRoles: string[];                  // Role IDs
  createdAt: Date;
  updatedAt: Date;
}
```

### Message (Channel Message)

```typescript
interface IMessage {
  _id: string;
  content: string;                         // max 4000 chars
  author: string;                          // User ID
  channel: string;                         // Channel ID
  server: string;                          // Server ID
  attachments: {
    url: string;
    filename: string;
    size: number;                          // bytes
    type: string;                          // MIME type
  }[];
  mentions: string[];                      // User IDs
  replyTo?: string;                        // Message ID
  isPinned: boolean;
  isEdited: boolean;
  editedAt?: Date;
  reactions: {
    emoji: string;
    users: string[];                       // User IDs
  }[];
  createdAt: Date;
  updatedAt: Date;
}
```

### DirectMessage

```typescript
interface IDirectMessage {
  _id: string;
  content: string;                         // max 4000 chars
  sender: string;                          // User ID
  receiver: string;                        // User ID
  attachments: {
    url: string;
    filename: string;
    size: number;
    type: string;
  }[];
  isRead: boolean;
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### FriendRequest

```typescript
interface IFriendRequest {
  _id: string;
  sender: string;                          // User ID
  receiver: string;                        // User ID
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
  updatedAt: Date;
}
```

### Invite

```typescript
interface IInvite {
  _id: string;
  code: string;                            // Unique, uppercase
  server: string;                          // Server ID
  inviter: string;                         // User ID
  maxUses?: number;                        // null = unlimited
  uses: number;
  expiresAt?: Date;                        // null = never
  createdAt: Date;
  updatedAt: Date;
}
```

### Role

```typescript
interface IRole {
  _id: string;
  name: string;                            // max 100 chars
  color: string;                           // Hex e.g. "#99AAB5"
  server: string;                          // Server ID
  permissions: {
    administrator: boolean;
    manageServer: boolean;
    manageRoles: boolean;
    manageChannels: boolean;
    kickMembers: boolean;
    banMembers: boolean;
    createInvite: boolean;                 // default: true
    manageMessages: boolean;
    sendMessages: boolean;                 // default: true
    readMessages: boolean;                 // default: true
    mentionEveryone: boolean;
    connect: boolean;                      // default: true (voice)
    speak: boolean;                        // default: true (voice)
    muteMembers: boolean;
    deafenMembers: boolean;
  };
  position: number;
  isDefault: boolean;                      // @everyone role
  createdAt: Date;
  updatedAt: Date;
}
```

---

## API Endpoints Reference

### 🔐 Auth — `/api/v1/auth`

| Method | Endpoint | Auth | Body / Params | Description |
|--------|----------|------|---------------|-------------|
| `POST` | `/register` | ❌ | `{ name, email, password, username? }` | Register new user |
| `POST` | `/login` | ❌ | `{ email, password }` | Login, returns JWT tokens |
| `POST` | `/refresh` | ❌ | (uses refresh token cookie) | Refresh access token |
| `GET` | `/status` | 🔓 Optional | — | Check auth status |
| `POST` | `/logout` | ✅ | — | Logout, clear tokens |
| `GET` | `/google` | ❌ | — | Start Google OAuth |
| `GET` | `/google/callback` | ❌ | — | Google OAuth callback |
| `GET` | `/github` | ❌ | — | Start GitHub OAuth |
| `GET` | `/github/callback` | ❌ | — | GitHub OAuth callback |
| `GET` | `/facebook` | ❌ | — | Start Facebook OAuth |
| `GET` | `/facebook/callback` | ❌ | — | Facebook OAuth callback |
| `POST` | `/send-email-otp` | ❌ | `{ email }` | Send email OTP |
| `POST` | `/verify-email-otp` | ❌ | `{ email, otp }` | Verify email OTP |
| `POST` | `/send-phone-otp` | ❌ | `{ phoneNumber }` | Send phone OTP |
| `POST` | `/verify-phone-otp` | ❌ | `{ phoneNumber, otp }` | Verify phone OTP |

### 👤 Users — `/api/v1/users` (All require auth ✅)

| Method | Endpoint | Body / Params | Description |
|--------|----------|---------------|-------------|
| `GET` | `/me` | — | Get current user profile |
| `PATCH` | `/me` | `{ name?, username?, bio? }` | Update profile |
| `DELETE` | `/me` | — | Delete account |
| `POST` | `/me/avatar` | `FormData: avatar (file)` | Upload avatar |
| `PATCH` | `/me/password` | `{ currentPassword, newPassword }` | Change password |
| `PATCH` | `/me/status` | `{ status: "online"\|"away"\|"dnd" }` | Update user status |
| `GET` | `/me/servers` | — | Get user's servers |
| `GET` | `/me/friends` | — | Get friends list |
| `POST` | `/me/friends/:userId` | `:userId` param | Add friend |
| `DELETE` | `/me/friends/:userId` | `:userId` param | Remove friend |
| `GET` | `/me/blocked` | — | Get blocked users |
| `POST` | `/me/blocked/:userId` | `:userId` param | Block user |
| `DELETE` | `/me/blocked/:userId` | `:userId` param | Unblock user |
| `GET` | `/search` | `?query=<string>` | Search users |
| `GET` | `/:id` | `:id` param | Get user by ID |

### 🖥️ Servers — `/api/v1/servers` (All require auth ✅)

| Method | Endpoint | Body / Params | Description |
|--------|----------|---------------|-------------|
| `POST` | `/` | `{ name, description?, isPublic? }` | Create server |
| `GET` | `/` | — | Get user's servers |
| `GET` | `/:serverId` | `:serverId` | Get server details |
| `PATCH` | `/:serverId` | `{ name?, description?, isPublic? }` | Update server |
| `DELETE` | `/:serverId` | `:serverId` | Delete server (owner only) |
| `POST` | `/:serverId/leave` | `:serverId` | Leave server |

#### Channels (nested under servers)

| Method | Endpoint | Body / Params | Description |
|--------|----------|---------------|-------------|
| `POST` | `/:serverId/channels` | `{ name, type: "text"\|"voice", category?, isPrivate? }` | Create channel |
| `GET` | `/:serverId/channels` | `:serverId` | Get all channels |
| `PATCH` | `/:serverId/channels/reorder` | `{ channels: [{id, position}] }` | Reorder channels |
| `GET` | `/channels/:channelId` | `:channelId` | Get channel |
| `PATCH` | `/channels/:channelId` | `{ name?, topic?, category?, isPrivate? }` | Update channel |
| `DELETE` | `/channels/:channelId` | `:channelId` | Delete channel |

#### Members (nested under servers)

| Method | Endpoint | Body / Params | Description |
|--------|----------|---------------|-------------|
| `GET` | `/:serverId/members` | `:serverId` | Get all members |
| `PATCH` | `/:serverId/members/:memberId/role` | `{ role: "admin"\|"moderator"\|"member" }` | Update member role |
| `DELETE` | `/:serverId/members/:memberId` | `:serverId, :memberId` | Kick member |

#### Invites (nested under servers)

| Method | Endpoint | Body / Params | Description |
|--------|----------|---------------|-------------|
| `POST` | `/:serverId/invites` | `{ maxUses?, expiresAt? }` | Create invite |
| `GET` | `/:serverId/invites` | `:serverId` | Get all server invites |

#### Roles (nested under servers)

| Method | Endpoint | Body / Params | Description |
|--------|----------|---------------|-------------|
| `POST` | `/:serverId/roles` | `{ name, color?, permissions? }` | Create role |
| `GET` | `/:serverId/roles` | `:serverId` | Get all server roles |

### 💬 Messages — `/api/v1/messages` (All require auth ✅)

| Method | Endpoint | Body / Params | Description |
|--------|----------|---------------|-------------|
| `POST` | `/channels/:channelId/messages` | `{ content, replyTo?, mentions? }` | Send message |
| `GET` | `/channels/:channelId/messages` | `?limit=&before=&after=` | Get messages (paginated) |
| `GET` | `/channels/:channelId/messages/pinned` | `:channelId` | Get pinned messages |
| `GET` | `/messages/:messageId` | `:messageId` | Get single message |
| `PATCH` | `/messages/:messageId` | `{ content }` | Edit message |
| `DELETE` | `/messages/:messageId` | `:messageId` | Delete message |
| `PATCH` | `/messages/:messageId/pin` | `:messageId` | Toggle pin |
| `POST` | `/messages/:messageId/reactions` | `{ emoji }` | Add reaction |
| `DELETE` | `/messages/:messageId/reactions/:emoji` | `:messageId, :emoji` | Remove reaction |

### ✉️ Direct Messages — `/api/v1/direct-messages` (All require auth ✅)

| Method | Endpoint | Body / Params | Description |
|--------|----------|---------------|-------------|
| `GET` | `/` | — | Get all conversations |
| `GET` | `/unread/count` | — | Get unread message count |
| `POST` | `/:recipientId` | `{ content }` | Send direct message |
| `GET` | `/:userId` | `?limit=&before=` | Get conversation (paginated) |
| `PATCH` | `/:userId/read` | `:userId` | Mark messages as read |
| `PATCH` | `/message/:messageId` | `{ content }` | Edit DM |
| `DELETE` | `/message/:messageId` | `:messageId` | Delete DM |
| `DELETE` | `/:userId` | `:userId` | Delete entire conversation |

### 🤝 Friend Requests — `/api/v1/friend-requests` (All require auth ✅)

| Method | Endpoint | Body / Params | Description |
|--------|----------|---------------|-------------|
| `GET` | `/` | — | Get all friend requests |
| `GET` | `/pending` | — | Get pending (received) |
| `GET` | `/sent` | — | Get sent requests |
| `POST` | `/:userId` | `:userId` | Send friend request |
| `PATCH` | `/:requestId/accept` | `:requestId` | Accept request |
| `PATCH` | `/:requestId/decline` | `:requestId` | Decline request |
| `DELETE` | `/:requestId` | `:requestId` | Cancel sent request |

### 🔗 Invites — `/api/v1/invites`

| Method | Endpoint | Auth | Body / Params | Description |
|--------|----------|------|---------------|-------------|
| `GET` | `/:code` | ❌ | `:code` | Preview invite (public) |
| `POST` | `/:code/join` | ✅ | `:code` | Join server via invite |
| `DELETE` | `/:code` | ✅ | `:code` | Revoke invite |
| `POST` | `/cleanup` | ✅ | — | Clean expired invites |

### 🎭 Roles — `/api/v1/roles` (All require auth ✅)

| Method | Endpoint | Body / Params | Description |
|--------|----------|---------------|-------------|
| `GET` | `/:roleId` | `:roleId` | Get role |
| `PATCH` | `/:roleId` | `{ name?, color?, permissions? }` | Update role |
| `DELETE` | `/:roleId` | `:roleId` | Delete role |
| `PATCH` | `/servers/:serverId/roles/reorder` | `{ roles: [{id, position}] }` | Reorder roles |
| `POST` | `/servers/:serverId/members/:memberId/roles/:roleId` | params | Assign role to member |
| `DELETE` | `/servers/:serverId/members/:memberId/roles/:roleId` | params | Remove role from member |

---

## Socket.IO Events

### Connection

```typescript
// Connect with auth token
const socket = io(SERVER_URL, {
  auth: { token: accessToken },
  transports: ["websocket", "polling"],
});
```

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `join:server` | `serverId: string` | Join a server room |
| `leave:server` | `serverId: string` | Leave a server room |
| `join:channel` | `channelId: string` | Join a channel room |
| `leave:channel` | `channelId: string` | Leave a channel room |

### Server → Client Events (emit helpers available)

| Target | Helper Function | Description |
|--------|----------------|-------------|
| Specific user | `emitToUser(userId, event, data)` | Send to `user:{userId}` room |
| All in server | `emitToServer(serverId, event, data)` | Broadcast to `server:{serverId}` room |
| All in channel | `emitToChannel(channelId, event, data)` | Broadcast to `channel:{channelId}` room |

### Auto-managed Events

- **On connect:** User status set to `"online"`, `lastSeen` updated
- **On disconnect:** User status set to `"offline"`, `lastSeen` updated

---

## Frontend Pages & Routes to Create

### Route Structure

```
/                           → Landing page (redirect to /channels/@me if logged in)
/login                      → Login page
/register                   → Register page
/verify-email               → Email OTP verification page
/verify-phone               → Phone OTP verification page
/invite/:code               → Invite preview + join page

/channels/@me               → Home — Friends list + DM conversations sidebar
/channels/@me/:userId       → Direct message conversation view

/servers/:serverId/:channelId  → Server view with channel messages
/servers/:serverId/settings    → Server settings (owner/admin only)

/settings                    → User settings page
/settings/profile            → Edit profile (name, username, bio)
/settings/account             → Account settings (email, password, delete)
/settings/preferences        → App preferences (theme, language, notifications)
```

### Page Descriptions & Components

#### 1. **Landing Page** (`/`)

- Hero section with app branding
- CTA buttons: "Login" and "Register"
- If user is already authenticated, redirect to `/channels/@me`

#### 2. **Register Page** (`/register`)

- **API:** `POST /api/v1/auth/register`
- Form fields: `name`, `email`, `password`, `username` (optional)
- OAuth buttons: Google, GitHub, Facebook
- OAuth flow: redirect to `/api/v1/auth/google`, `/api/v1/auth/github`, `/api/v1/auth/facebook`
- On success → redirect to email verification or `/channels/@me`

#### 3. **Login Page** (`/login`)

- **API:** `POST /api/v1/auth/login`
- Form fields: `email`, `password`
- OAuth buttons: same as register
- On success → store tokens, redirect to `/channels/@me`

#### 4. **Email Verification Page** (`/verify-email`)

- **APIs:**
  - `POST /api/v1/auth/send-email-otp` — send OTP
  - `POST /api/v1/auth/verify-email-otp` — verify OTP
- OTP input field (6-digit code)

#### 5. **Phone Verification Page** (`/verify-phone`)

- **APIs:**
  - `POST /api/v1/auth/send-phone-otp` — send OTP
  - `POST /api/v1/auth/verify-phone-otp` — verify OTP
- Phone number input + OTP input

#### 6. **Invite Preview Page** (`/invite/:code`)

- **APIs:**
  - `GET /api/v1/invites/:code` — get invite details (public, no auth)
  - `POST /api/v1/invites/:code/join` — join server (requires auth)
- Show server name, icon, member count
- "Join Server" button (redirect to login if not authenticated)

#### 7. **Home / Friends & DMs** (`/channels/@me`)

- **Sidebar (left):**
  - User's servers list → `GET /api/v1/users/me/servers` or `GET /api/v1/servers`
  - DM conversations list → `GET /api/v1/direct-messages`
  - Unread badge → `GET /api/v1/direct-messages/unread/count`
  - "Create Server" button → opens modal
- **Main area:**
  - Friends list → `GET /api/v1/users/me/friends`
  - Tabs: "Online", "All", "Pending", "Blocked"
  - Pending requests → `GET /api/v1/friend-requests/pending`
  - Sent requests → `GET /api/v1/friend-requests/sent`
  - Blocked users → `GET /api/v1/users/me/blocked`
  - "Add Friend" button → user search → `GET /api/v1/users/search?query=`
  - Accept/Decline/Cancel request actions
- **User panel (bottom-left):**
  - Current user avatar, name, status
  - Status picker (online/away/dnd)
  - Settings gear icon → `/settings`

#### 8. **Direct Message Conversation** (`/channels/@me/:userId`)

- **APIs:**
  - `GET /api/v1/direct-messages/:userId` — get messages (paginated, infinite scroll)
  - `POST /api/v1/direct-messages/:recipientId` — send message
  - `PATCH /api/v1/direct-messages/message/:messageId` — edit message
  - `DELETE /api/v1/direct-messages/message/:messageId` — delete message
  - `PATCH /api/v1/direct-messages/:userId/read` — mark as read
- Message input with send button
- Message list (scroll up to load older)
- Right-click/hover context menu: edit, delete
- User info sidebar: profile view, block/unblock, remove friend

#### 9. **Server View** (`/servers/:serverId/:channelId`)

- **APIs on load:**
  - `GET /api/v1/servers/:serverId` — server details
  - `GET /api/v1/servers/:serverId/channels` — channel list
  - `GET /api/v1/servers/:serverId/members` — member list
- **Sidebar (left):**
  - Server name + dropdown (settings, invites, leave)
  - Channel list grouped by category
  - Text channels (🔤) and Voice channels (🔊)
  - "Create Channel" button (admin/owner)
- **Main area (text channel selected):**
  - `GET /api/v1/messages/channels/:channelId/messages` — paginated messages
  - `POST /api/v1/messages/channels/:channelId/messages` — send message
  - `PATCH /api/v1/messages/messages/:messageId` — edit
  - `DELETE /api/v1/messages/messages/:messageId` — delete
  - `PATCH /api/v1/messages/messages/:messageId/pin` — toggle pin
  - `POST /api/v1/messages/messages/:messageId/reactions` — add reaction
  - `DELETE /api/v1/messages/messages/:messageId/reactions/:emoji` — remove reaction
  - Pinned messages panel → `GET /api/v1/messages/channels/:channelId/messages/pinned`
- **Members sidebar (right):**
  - Members list grouped by role (Owner, Admins, Moderators, Members)
  - Online/offline indicators
  - Click → user profile popup
- **Socket.IO:** Join `server:{serverId}` and `channel:{channelId}` rooms on mount

#### 10. **Server Settings** (`/servers/:serverId/settings`)

- **Tabs:**
  - **Overview:** Edit name, description, icon, banner, public/private
    - `PATCH /api/v1/servers/:serverId`
  - **Roles:** Manage roles and permissions
    - `GET /api/v1/servers/:serverId/roles`
    - `POST /api/v1/servers/:serverId/roles`
    - `PATCH /api/v1/roles/:roleId`
    - `DELETE /api/v1/roles/:roleId`
    - `PATCH /api/v1/roles/servers/:serverId/roles/reorder`
    - Assign/remove roles: `POST/DELETE /api/v1/roles/servers/:serverId/members/:memberId/roles/:roleId`
  - **Members:** Manage members
    - `GET /api/v1/servers/:serverId/members`
    - `PATCH /api/v1/servers/:serverId/members/:memberId/role` — change hierarchy role
    - `DELETE /api/v1/servers/:serverId/members/:memberId` — kick
  - **Invites:** Manage invites
    - `GET /api/v1/servers/:serverId/invites`
    - `POST /api/v1/servers/:serverId/invites`
    - `DELETE /api/v1/invites/:code`
  - **Danger Zone:** Delete server
    - `DELETE /api/v1/servers/:serverId`

#### 11. **User Settings** (`/settings`)

- **Profile tab** (`/settings/profile`):
  - `GET /api/v1/users/me` — load current data
  - `PATCH /api/v1/users/me` — update name, username, bio
  - `POST /api/v1/users/me/avatar` — upload avatar (FormData)
- **Account tab** (`/settings/account`):
  - `PATCH /api/v1/users/me/password` — change password
  - `DELETE /api/v1/users/me` — delete account
  - Email/phone verification status
- **Preferences tab** (`/settings/preferences`):
  - Theme selector (light/dark/auto)
  - Language selector
  - Notification toggles

#### 12. **Create Server Modal** (overlay, not a route)

- **API:** `POST /api/v1/servers`
- Fields: server name, description (optional), public toggle
- After creation → redirect to `/servers/:newServerId/:defaultChannelId`

#### 13. **Create/Edit Channel Modal** (overlay)

- **Create:** `POST /api/v1/servers/:serverId/channels`
- **Edit:** `PATCH /api/v1/servers/channels/:channelId`
- Fields: name, type (text/voice), category, topic, private toggle

---

## Frontend File & Folder Structure

```
client/src/
├── api/
│   ├── axiosInstance.ts            # Axios instance with baseURL, interceptors, token refresh
│   ├── auth.api.ts                 # register, login, logout, refresh, OAuth URLs, OTP
│   ├── user.api.ts                 # getMe, updateProfile, uploadAvatar, friends, blocking, search
│   ├── server.api.ts               # CRUD servers, members, kick, leave
│   ├── channel.api.ts              # CRUD channels, reorder
│   ├── message.api.ts              # CRUD messages, reactions, pins
│   ├── directMessage.api.ts        # DM conversations, send, edit, delete, read
│   ├── friendRequest.api.ts        # send, accept, decline, cancel, lists
│   ├── invite.api.ts               # preview, join, create, revoke
│   └── role.api.ts                 # CRUD roles, assign, remove, reorder
│
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx           # Main layout: server sidebar + content area
│   │   ├── ServerSidebar.tsx       # Server icons list (left edge)
│   │   ├── ChannelSidebar.tsx      # Channel list within a server
│   │   ├── DMSidebar.tsx           # DM conversations list
│   │   ├── MemberSidebar.tsx       # Members list (right side)
│   │   └── UserPanel.tsx           # Current user info + status (bottom-left)
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── OAuthButtons.tsx
│   │   └── OTPInput.tsx
│   ├── chat/
│   │   ├── MessageList.tsx         # Scrollable message list with infinite scroll
│   │   ├── MessageItem.tsx         # Single message with avatar, content, reactions
│   │   ├── MessageInput.tsx        # Text input + send button + file attach
│   │   ├── ReactionPicker.tsx      # Emoji picker for reactions
│   │   └── PinnedMessages.tsx      # Pinned messages panel
│   ├── server/
│   │   ├── CreateServerModal.tsx
│   │   ├── ServerSettings.tsx
│   │   ├── InviteModal.tsx
│   │   ├── ChannelItem.tsx
│   │   └── CreateChannelModal.tsx
│   ├── user/
│   │   ├── UserProfile.tsx         # User profile card/popup
│   │   ├── UserAvatar.tsx          # Avatar component with status indicator
│   │   ├── StatusPicker.tsx        # Status dropdown (online/away/dnd)
│   │   └── UserSettings.tsx
│   ├── friends/
│   │   ├── FriendsList.tsx
│   │   ├── FriendItem.tsx
│   │   ├── PendingRequests.tsx
│   │   ├── AddFriendModal.tsx
│   │   └── FriendRequestItem.tsx
│   ├── roles/
│   │   ├── RoleList.tsx
│   │   ├── RoleEditor.tsx
│   │   └── PermissionToggles.tsx
│   └── common/
│       ├── Modal.tsx
│       ├── Tooltip.tsx
│       ├── ContextMenu.tsx
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       └── ProtectedRoute.tsx      # Auth guard wrapper
│
├── hooks/
│   ├── useAuth.ts                  # Auth state, login/logout/refresh logic
│   ├── useSocket.ts                # Socket.IO connection + event management
│   ├── useMessages.ts              # Message fetching + infinite scroll
│   └── useDebounce.ts              # Debounce for search inputs
│
├── pages/
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── VerifyEmailPage.tsx
│   ├── VerifyPhonePage.tsx
│   ├── InvitePage.tsx
│   ├── HomePage.tsx                # /channels/@me — Friends + DM list
│   ├── DMConversationPage.tsx      # /channels/@me/:userId
│   ├── ServerPage.tsx              # /servers/:serverId/:channelId
│   ├── ServerSettingsPage.tsx      # /servers/:serverId/settings
│   └── SettingsPage.tsx            # /settings (with sub-tabs)
│
├── routes/
│   └── AppRouter.tsx               # All route definitions
│
├── store/
│   ├── authStore.ts                # User auth state (Zustand or Redux)
│   ├── serverStore.ts              # Current server + channels state
│   ├── messageStore.ts             # Messages state
│   ├── dmStore.ts                  # DM conversations state
│   ├── friendStore.ts              # Friends + requests state
│   └── socketStore.ts              # Socket connection state
│
├── types/
│   ├── user.types.ts               # IUser, IUserPreferences
│   ├── server.types.ts             # IServer, IServerMember
│   ├── channel.types.ts            # IChannel
│   ├── message.types.ts            # IMessage, IDirectMessage, IAttachment, IReaction
│   ├── invite.types.ts             # IInvite
│   ├── role.types.ts               # IRole, IRolePermissions
│   ├── friendRequest.types.ts      # IFriendRequest
│   └── api.types.ts                # API response wrappers
│
├── validation/
│   ├── auth.schema.ts              # Zod schemas for login/register forms
│   ├── server.schema.ts            # Server create/update validation
│   ├── channel.schema.ts           # Channel validation
│   └── message.schema.ts           # Message validation
│
├── App.tsx                         # Root component
├── main.tsx                        # Entry point
└── index.css                       # Global styles
```

---

## API Service Layer Instructions

### Axios Instance Setup

```typescript
// src/api/axiosInstance.ts
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,  // Send cookies (JWT refresh token)
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401, auto-refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        localStorage.setItem("accessToken", data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Example API Service

```typescript
// src/api/auth.api.ts
import api from "./axiosInstance";

export const authApi = {
  register: (data: { name: string; email: string; password: string; username?: string }) =>
    api.post("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  logout: () => api.post("/auth/logout"),

  getStatus: () => api.get("/auth/status"),

  refreshToken: () => api.post("/auth/refresh"),

  sendEmailOtp: (email: string) => api.post("/auth/send-email-otp", { email }),

  verifyEmailOtp: (email: string, otp: string) =>
    api.post("/auth/verify-email-otp", { email, otp }),
};
```

---

## State Management Guidelines

### Auth Flow

1. On app load → call `GET /auth/status` to check if user is logged in
2. If authenticated → store user data in auth store, redirect to `/channels/@me`
3. If not → show landing/login page
4. On login success → store `accessToken` in localStorage, user data in store
5. On 401 → interceptor auto-refreshes using cookie-based refresh token
6. On logout → clear store + localStorage, redirect to `/login`

### Socket.IO Flow

1. After auth success → connect socket with `auth: { token: accessToken }`
2. On connect → join user's server rooms (`join:server` for each server)
3. When viewing a channel → `join:channel` on mount, `leave:channel` on unmount
4. Listen for real-time events (new messages, status changes, etc.)
5. On logout → disconnect socket

### Key Real-time Events to Implement

| Event Name (suggested) | Trigger | Action |
|------------------------|---------|--------|
| `message:new` | New message in channel | Append to message list |
| `message:edit` | Message edited | Update message in list |
| `message:delete` | Message deleted | Remove from list |
| `dm:new` | New direct message | Show notification + update DM list |
| `dm:read` | Messages marked read | Update read status |
| `user:status` | User status change | Update status indicator |
| `member:join` | New member joined server | Update member list |
| `member:leave` | Member left/kicked | Update member list |
| `channel:create` | New channel created | Add to channel list |
| `channel:update` | Channel updated | Update channel in list |
| `channel:delete` | Channel deleted | Remove from list |
| `friend:request` | New friend request | Show notification |
| `friend:accept` | Friend request accepted | Update friends list |

---

## Authentication Notes

- **JWT Access Token:** Short-lived, stored in `localStorage`, sent as `Authorization: Bearer <token>`
- **JWT Refresh Token:** Long-lived, stored in HTTP-only cookie, used by `POST /auth/refresh`
- **OAuth Flow:** Redirect to `/api/v1/auth/google` (or github/facebook) → server handles OAuth → redirects back with tokens set in cookies
- **Rate Limiting:** Register, login, and OTP endpoints are rate-limited — handle `429 Too Many Requests` in the frontend

---

## Important Environment Variable

```env
# client/.env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```
