# Discord App — Backend Server

A real-time Discord clone backend built with **TypeScript**, **Express 5**, **MongoDB**, **Redis**, and **Socket.IO**.

## Tech Stack

| Layer           | Technology                                |
| --------------- | ----------------------------------------- |
| Runtime         | Node.js + TypeScript (tsx/nodemon)        |
| Framework       | Express 5                                 |
| Database        | MongoDB (Mongoose 9)                      |
| Cache / Pub-Sub | Redis (ioredis)                           |
| Real-time       | Socket.IO 4 + Redis adapter              |
| Auth            | JWT + Passport (Google, GitHub, Facebook) |
| Validation      | Zod 4                                     |
| File Upload     | Multer (memory) → Cloudinary / AWS S3     |
| Email           | Nodemailer (SMTP)                         |
| SMS             | Twilio                                    |


## Directory Structure

```
server/
├── .env.example          # Environment variable template
├── nodemon.json          # Dev server config (tsx)
├── package.json
├── tsconfig.json         # TypeScript config with path aliases
└── src/
    ├── server.ts         # Entry point — middleware, routes, startup, graceful shutdown
    ├── config/
    │   ├── db.config.ts       # MongoDB connection
    │   ├── env.config.ts      # Env validation, typed getEnv()
    │   ├── passport.config.ts # OAuth strategies (Google, GitHub, Facebook)
    │   └── redis.config.ts    # Redis pub/sub clients
    ├── constants/
    │   ├── errorMessages.ts   # Centralised error strings
    │   ├── httpStatus.ts      # HTTP status code map
    │   └── successMessages.ts # Centralised success strings
    ├── controllers/           # Route handlers (auth, user, server, channel, message, DM, invite, role, OTP)
    ├── middlewares/
    │   ├── auth.middleware.ts      # JWT auth, optionalAuth, RBAC, ownership check
    │   ├── errorHandler.ts        # Global error handler (Mongoose + ApiError)
    │   ├── rateLimit.middleware.ts # Redis-backed rate limiters
    │   ├── upload.middleware.ts    # Multer configs for avatar, icon, banner, attachments, emoji
    │   └── validate.middleware.ts  # Zod body/params/query validators
    ├── models/                # Mongoose schemas & models
    ├── routes/                # Express routers
    ├── services/
    │   ├── cloudinary.service.ts # Image upload/delete via Cloudinary
    │   ├── email.service.ts      # SMTP email (OTP, welcome, login alert, etc.)
    │   ├── s3.service.ts         # AWS S3 file operations
    │   └── sms.service.ts        # Twilio SMS OTP
    ├── socket/
    │   └── socketHandler.ts   # Socket.IO init, auth middleware, room management
    ├── templates/             # Email HTML/text templates
    ├── types/                 # TypeScript interfaces & ambient declarations
    ├── utils/                 # Helpers (ApiError, JWT, bcrypt, Redis OTP, response helpers)
    └── validations/           # Zod schemas for request validation
```


## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** (local or Atlas)
- **Redis** (local or hosted)

### Installation

```bash
cd server
npm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

**Required** (server won't start without these):

| Variable         | Description                    |
| ---------------- | ------------------------------ |
| `MONGODB_URI`    | MongoDB connection string      |
| `SESSION_SECRET` | Express session signing secret |
| `REDIS_URL`      | Redis connection URL           |
| `JWT_SECRET`     | JWT signing secret             |

**Optional** — have sensible defaults or are feature-gated:

| Variable              | Purpose                          |
| --------------------- | -------------------------------- |
| `PORT`                | Server port (default `5000`)     |
| `CLIENT_URL`          | Frontend origin for CORS         |
| `NODE_ENV`            | `development` / `production`     |
| `JWT_EXPIRE`          | Token lifetime (default `7d`)    |
| `GOOGLE_CLIENT_*`     | Google OAuth                     |
| `GITHUB_CLIENT_*`     | GitHub OAuth                     |
| `FACEBOOK_APP_*`      | Facebook OAuth                   |
| `CLOUDINARY_*`        | Cloudinary image uploads         |
| `SMTP_*`              | Email delivery (SMTP)            |
| `TWILIO_*`            | SMS OTP via Twilio               |
| `AWS_*`               | S3 file storage + CloudFront CDN |

### Running Locally

```bash
# Development (auto-reload via nodemon + tsx)
npm run dev

# Type-check without emitting
npm run type-check

# Build for production
npm run build

# Start production build
npm start
```


## API Routes

Base URL: `/api/v1`

### Authentication — `/auth`

| Method | Endpoint                 | Auth | Description                      |
| ------ | ------------------------ | ---- | -------------------------------- |
| POST   | `/register`              | ✗    | Register with email/password     |
| POST   | `/login`                 | ✗    | Login with email or username     |
| POST   | `/refresh`               | ✗    | Refresh access token             |
| POST   | `/logout`                | ✓    | Logout & blacklist token         |
| GET    | `/status`                | ~    | Check auth status (optional auth)|
| GET    | `/google`                | ✗    | Start Google OAuth flow          |
| GET    | `/google/callback`       | ✗    | Google OAuth callback            |
| GET    | `/github`                | ✗    | Start GitHub OAuth flow          |
| GET    | `/github/callback`       | ✗    | GitHub OAuth callback            |
| GET    | `/facebook`              | ✗    | Start Facebook OAuth flow        |
| GET    | `/facebook/callback`     | ✗    | Facebook OAuth callback          |
| POST   | `/send-email-otp`        | ✗    | Send email verification OTP      |
| POST   | `/verify-email-otp`      | ✗    | Verify email OTP                 |
| POST   | `/send-phone-otp`        | ✗    | Send phone verification OTP      |
| POST   | `/verify-phone-otp`      | ✗    | Verify phone OTP                 |

### Users — `/users`

All routes require authentication.

| Method | Endpoint                    | Description                       |
| ------ | --------------------------- | --------------------------------- |
| GET    | `/me`                       | Get current user profile          |
| PATCH  | `/me`                       | Update profile (name, bio, etc.)  |
| DELETE | `/me`                       | Delete account                    |
| POST   | `/me/avatar`                | Upload avatar (multipart form)    |
| PATCH  | `/me/password`              | Change password                   |
| PATCH  | `/me/status`                | Update status (online/away/dnd)   |
| GET    | `/me/servers`               | List user's servers               |
| GET    | `/me/friends`               | List friends                      |
| POST   | `/me/friends/:userId`       | Add friend                        |
| DELETE | `/me/friends/:userId`       | Remove friend                     |
| GET    | `/me/blocked`               | List blocked users                |
| POST   | `/me/blocked/:userId`       | Block user                        |
| DELETE | `/me/blocked/:userId`       | Unblock user                      |
| GET    | `/search`                   | Search users by username/email    |
| GET    | `/:id`                      | Get user by ID                    |

### Servers — `/servers`

All routes require authentication.

| Method | Endpoint                                 | Description              |
| ------ | ---------------------------------------- | ------------------------ |
| POST   | `/`                                      | Create server            |
| GET    | `/`                                      | List user's servers      |
| GET    | `/:serverId`                             | Get server details       |
| PATCH  | `/:serverId`                             | Update server            |
| DELETE | `/:serverId`                             | Delete server            |
| POST   | `/:serverId/leave`                       | Leave server             |
| POST   | `/:serverId/channels`                    | Create channel           |
| GET    | `/:serverId/channels`                    | List server channels     |
| PATCH  | `/:serverId/channels/reorder`            | Reorder channels         |
| GET    | `/channels/:channelId`                   | Get channel by ID        |
| PATCH  | `/channels/:channelId`                   | Update channel           |
| DELETE | `/channels/:channelId`                   | Delete channel           |
| GET    | `/:serverId/members`                     | List server members      |
| PATCH  | `/:serverId/members/:memberId/role`      | Update member role       |
| DELETE | `/:serverId/members/:memberId`           | Kick member              |
| POST   | `/:serverId/invites`                     | Create invite            |
| GET    | `/:serverId/invites`                     | List server invites      |
| POST   | `/:serverId/roles`                       | Create role              |
| GET    | `/:serverId/roles`                       | List server roles        |

### Messages — `/messages`

All routes require authentication.

| Method | Endpoint                                    | Description               |
| ------ | ------------------------------------------- | ------------------------- |
| POST   | `/channels/:channelId/messages`             | Send message              |
| GET    | `/channels/:channelId/messages`             | Get channel messages      |
| GET    | `/channels/:channelId/messages/pinned`      | Get pinned messages       |
| GET    | `/messages/:messageId`                      | Get single message        |
| PATCH  | `/messages/:messageId`                      | Edit message              |
| DELETE | `/messages/:messageId`                      | Delete message            |
| PATCH  | `/messages/:messageId/pin`                  | Toggle pin                |
| POST   | `/messages/:messageId/reactions`            | Add reaction              |
| DELETE | `/messages/:messageId/reactions/:emoji`     | Remove reaction           |

### Direct Messages — `/direct-messages`

All routes require authentication.

| Method | Endpoint                  | Description                    |
| ------ | ------------------------- | ------------------------------ |
| GET    | `/`                       | List all conversations         |
| GET    | `/unread/count`           | Get unread message count       |
| POST   | `/:recipientId`           | Send direct message            |
| GET    | `/:userId`                | Get conversation with user     |
| PATCH  | `/:userId/read`           | Mark messages as read          |
| DELETE | `/:userId`                | Delete entire conversation     |
| PATCH  | `/message/:messageId`     | Edit a direct message          |
| DELETE | `/message/:messageId`     | Delete a direct message        |

### Friend Requests — `/friend-requests`

All routes require authentication.

| Method | Endpoint               | Description              |
| ------ | ---------------------- | ------------------------ |
| GET    | `/`                    | Get all friend requests  |
| GET    | `/pending`             | Get pending (received)   |
| GET    | `/sent`                | Get sent requests        |
| POST   | `/:userId`             | Send friend request      |
| PATCH  | `/:requestId/accept`   | Accept request           |
| PATCH  | `/:requestId/decline`  | Decline request          |
| DELETE | `/:requestId`          | Cancel sent request      |

### Invites — `/invites`

| Method | Endpoint          | Auth | Description                  |
| ------ | ----------------- | ---- | ---------------------------- |
| GET    | `/:code`          | ✗    | Preview invite               |
| POST   | `/cleanup`        | ✓    | Clean up expired invites     |
| POST   | `/:code/join`     | ✓    | Join server via invite code  |
| DELETE | `/:code`          | ✓    | Revoke / delete invite       |

### Roles — `/roles`

All routes require authentication.

| Method | Endpoint                                           | Description        |
| ------ | -------------------------------------------------- | ------------------ |
| PATCH  | `/servers/:serverId/roles/reorder`                 | Reorder roles      |
| POST   | `/servers/:serverId/members/:memberId/roles/:roleId` | Assign role      |
| DELETE | `/servers/:serverId/members/:memberId/roles/:roleId` | Remove role      |
| GET    | `/:roleId`                                         | Get role           |
| PATCH  | `/:roleId`                                         | Update role        |
| DELETE | `/:roleId`                                         | Delete role        |

### Debug — `/debug`

> **Blocked in production.** Only available in `development` / `staging`. Requires authentication.

| Method | Endpoint         | Description             |
| ------ | ---------------- | ----------------------- |
| GET    | `/cache`         | Dump all Redis keys     |
| GET    | `/cache/:key`    | Inspect single key      |
| DELETE | `/cache`         | Flush entire cache      |

### Health Check

| Method | Endpoint   | Description                          |
| ------ | ---------- | ------------------------------------ |
| GET    | `/health`  | Server health, uptime, environment   |


## Architecture

### Middleware Pipeline (in order)

1. **CORS** — whitelists `CLIENT_URL`
2. **Helmet** — security headers (CSP disabled in dev)
3. **Compression** — gzip responses
4. **Morgan** — HTTP request logging
5. **Body parsers** — JSON + URL-encoded (10 MB limit)
6. **Cookie parser** — for JWT cookie auth
7. **Express session** — for Passport OAuth flows
8. **Passport** — OAuth initialization

### Error Handling

All errors flow through a global `errorHandler` middleware that handles:
- **Mongoose `ValidationError`** → 400 with field-level details
- **MongoDB duplicate key (11000)** → 409 Conflict
- **Mongoose `CastError`** → 400 "Invalid ID format"
- **`ApiError`** → custom status code + message
- **Unknown errors** → 500 "Something went wrong"

### Rate Limiting

Redis-backed rate limiters for:
- Login: 5 attempts / 15 min
- Registration: 3 attempts / 15 min
- Password reset: 3 attempts / 1 hour
- Email verification: 5 attempts / 30 min
- Phone OTP: 3 attempts / 10 min
- General API: 100 requests / 15 min

### Socket.IO

- Uses Redis adapter for horizontal scaling
- JWT authentication middleware on connection
- Room-based events: `user:{id}`, `server:{id}`, `channel:{id}`
- Auto-updates user `status` on connect/disconnect


## Deployment

### Build

```bash
npm run build    # Compiles TypeScript → dist/
npm start        # Runs dist/server.ts via Node
```

### Required Infrastructure

- **MongoDB** — Atlas recommended for production
- **Redis** — required for rate limiting, OTP storage, token blacklisting, Socket.IO adapter
- **SMTP** — for email delivery (OTP, welcome, alerts)

### Environment Checklist

1. Set `NODE_ENV=production`
2. Set `CLIENT_URL` to your frontend domain
3. Use strong, unique secrets for `JWT_SECRET` and `SESSION_SECRET`
4. Configure OAuth callback URLs to match your production domain
5. Enable `trust proxy` in Express if behind a load balancer / reverse proxy


## License

MIT
