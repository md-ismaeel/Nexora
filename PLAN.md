# Discord App Frontend Architecture Plan

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technology Stack](#2-technology-stack)
3. [Folder Structure](#3-folder-structure)
4. [State Management](#4-state-management)
5. [API Integration Pattern](#5-api-integration-pattern)
6. [Component Architecture](#6-component-architecture)
7. [HeroUI v3 Integration](#7-heroui-v3-integration)
8. [Type Definitions](#8-type-definitions)
9. [Routing & Navigation](#9-routing--navigation)
10. [Implementation Roadmap](#10-implementation-roadmap)

---

## 1. Executive Summary

This document outlines the comprehensive frontend architecture for the Discord App project. The architecture follows modern React best practices, emphasizing:

- **Modular Design**: Clear separation of concerns with feature-based organization
- **Scalability**: RTK Query for efficient server state management
- **Maintainability**: TypeScript for type safety and HeroUI v3 for consistent UI
- **Performance**: Optimistic updates, memoization, and efficient re-renders

---

## 2. Technology Stack

| Category             | Technology                    | Version   |
| -------------------- | ----------------------------- | --------- |
| UI Framework         | React                         | 19.x      |
| UI Component Library | HeroUI                        | 3.x       |
| State Management     | Redux Toolkit                 | 2.x       |
| Routing              | React Router DOM              | 6.x       |
| HTTP Client          | RTK Query (via Redux Toolkit) | -         |
| Real-time            | Socket.io Client              | 4.x       |
| Animation            | Motion                        | 12.x      |
| Form Handling        | React Hook Form + Zod         | 7.x / 4.x |
| Styling              | Tailwind CSS                  | 4.x       |

---

## 3. Folder Structure

```
frontend/src/
├── api/                        # RTK Query API definitions
│   ├── base_api.ts            # Base API configuration with auth interceptor
│   ├── auth_api.ts            # Authentication endpoints
│   ├── user_api.ts            # User profile & settings endpoints
│   ├── server_api.ts          # Server CRUD, members, invites, bans, discovery
│   ├── channel_api.ts         # Channel CRUD operations
│   ├── category_api.ts        # Channel category management
│   ├── message_api.ts         # Message sending & fetching
│   ├── friend_api.ts          # Friends list & requests
│   ├── dm_api.ts              # Direct messages
│   └── role_api.ts            # Role management
│
├── components/
│   ├── ui/                    # HeroUI component re-exports (barrel file)
│   │   └── index.ts
│   ├── custom/                # Custom reusable components
│   │   ├── user-avatar.tsx    # User avatar with status indicator
│   │   ├── user-profile.tsx   # User profile card/modal
│   │   ├── empty-state.tsx    # Empty state placeholder
│   │   ├── toast.tsx          # Custom toast notifications
│   │   ├── context-menu.tsx   # Right-click context menu
│   │   └── page-loader.tsx    # Full-page loading spinner
│   ├── layout/                # Layout components
│   │   ├── root-layout.tsx    # Root route layout
│   │   ├── auth-layout.tsx    # Authentication pages layout
│   │   ├── app-layout.tsx     # Main app layout with sidebar
│   │   ├── channel-sidebar.tsx # Left channel/DM sidebar
│   │   ├── server-sidebar.tsx # Server list sidebar
│   │   └── member-sidebar.tsx # Right member list sidebar
│   ├── auth/                  # Auth-related components
│   │   ├── auth-guard.tsx     # Protected route guard
│   │   └── guest-guard.tsx    # Guest-only route guard
│   └── features/              # Feature-specific components
│       ├── chat/              # Chat-related components
│       │   ├── message-list.tsx
│       │   ├── message-input.tsx
│       │   └── typing-indicator.tsx
│       ├── channel/           # Channel components
│       │   ├── channel-item.tsx
│       │   └── create-channel-modal.tsx
│       └── server/            # Server components
│           ├── server-settings.tsx
│           └── server-card.tsx
│
├── hooks/                      # Custom React hooks
│   ├── use-auth.ts            # Auth context hook
│   ├── use-socket.ts          # Socket connection hook
│   ├── use-message.ts         # Message handling hook
│   ├── use-typing.ts          # Typing indicator hook
│   ├── use-debounce.ts        # Debounce utility hook
│   └── use-mobile.ts         # Mobile breakpoint hook
│
├── pages/
│   ├── auth/                  # Authentication pages
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── verify-email.tsx
│   │   ├── verify-phone.tsx
│   │   ├── forgot-password.tsx
│   │   ├── reset-password.tsx
│   │   └── oauth-success.tsx
│   ├── app/                   # Main application pages
│   │   ├── home.tsx           # Home/dashboard
│   │   ├── server-home.tsx    # Server home
│   │   ├── channel.tsx        # Channel chat view
│   │   ├── dm-chat.tsx        # DM chat view
│   │   ├── friends.tsx        # Friends list page
│   │   ├── settings.tsx       # User settings
│   │   └── server-settings.tsx # Server settings
│   ├── invite.tsx             # Server invite page
│   └── not-found.tsx          # 404 page
│
├── routes/                     # Routing configuration
│   ├── routes.tsx             # Main router definition
│   ├── lazy-routes.ts         # Lazy loading exports
│   └── suspend.tsx            # Suspense wrapper
│
├── store/                      # Redux store configuration
│   ├── store.ts               # Store creation & middleware
│   ├── hooks.ts               # Typed Redux hooks (useAppSelector, useAppDispatch)
│   └── slices/                # Redux slices
│       ├── auth_slice.ts      # Auth state (user, token, loading)
│       ├── ui_slice.ts        # UI state (modals, sidebars, theme)
│       ├── socket_slice.ts    # Socket connection state
│       ├── message_slice.ts   # Message cache & pagination
│       ├── dm_slice.ts        # DM state & unread counts
│       └── server_slice.ts    # Server list & active server
│
├── types/                      # TypeScript type definitions
│   ├── api.types.ts           # Generic API response types
│   ├── auth.types.ts          # Auth-related types
│   ├── user.types.ts          # User types
│   ├── server.types.ts        # Server, Channel, Role, Invite types
│   ├── message.types.ts       # Message types
│   └── socket.types.ts        # Socket event types
│
├── utils/                      # Utility functions
│   ├── axios.ts               # Axios instance (legacy, unused)
│   ├── socket.ts              # Socket.io client instance
│   ├── utils.ts               # General utilities (cn, format helpers)
│   ├── lucide.ts              # Icon components mapping
│   └── motion.ts              # Motion animation variants
│
├── App.tsx                     # Root application component
├── main.tsx                    # Entry point with providers
└── index.css                   # Global styles & Tailwind
```

---

## 4. State Management

### 4.1 Redux Store Structure

The store uses a hybrid approach combining **RTK Query** (for server state) with **Redux Slices** (for client state).

```typescript
// store/store.ts structure
{
  // ── Client State (Redux Slices) ─────────────────────────────
  auth: AuthState,           // User, token, loading state
  ui: UIState,               // Modals, sidebars, theme
  socket: SocketState,       // Connection status
  message: MessageState,     // Active channel messages
  dm: DMState,               // DM conversations, unread
  server: ServerState,       // Server list, active server

  // ── Server State (RTK Query Cache) ─────────────────────────
  baseApi: { /* auto-generated */ },
}
```

### 4.2 Slice Responsibilities

| Slice           | Purpose           | Key State                               |
| --------------- | ----------------- | --------------------------------------- |
| `auth_slice`    | Authentication    | user, token, isAuthenticated, isLoading |
| `ui_slice`      | UI state          | activeModal, isSidebarOpen, theme       |
| `socket_slice`  | Socket connection | isConnected, socketRef                  |
| `message_slice` | Message cache     | messages, pagination, typingUsers       |
| `dm_slice`      | Direct messages   | conversations, unreadCounts             |
| `server_slice`  | Server list       | servers[], activeServerId               |

---

## 5. API Integration Pattern

### 5.1 RTK Query Pattern

All API integrations follow the RTK Query pattern with:

1. **Base API Configuration** (`base_api.ts`)
   - Automatic token refresh on 401
   - Retry logic with exponential backoff
   - Credential inclusion (httpOnly cookies)

2. **Endpoint Definition** (`*_api.ts` files)
   - Query/Mutation definitions
   - Optimistic updates via `onQueryStarted`
   - Cache invalidation tags

3. **Tag Types** (defined in `base_api.ts`)
   ```typescript
   tagTypes: [
     "Auth",
     "User",
     "Server",
     "Channel",
     "Message",
     "Friend",
     "FriendRequest",
     "DirectMessage",
     "Invite",
     "Role",
   ];
   ```

### 5.2 API File Structure

```typescript
// Example: server_api.ts pattern
export const serverApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Query with optimistic update
    getMyServers: build.query<ApiResponse<IServer[]>, void>({
      query: () => "/servers",
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setServers(data.data));
      },
      providesTags: ["Server"],
    }),

    // Mutation with optimistic update
    createServer: build.mutation<ApiResponse<IServer>, CreateServerBody>({
      query: (body) => ({ url: "/servers", method: "POST", body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(addServer(data.data));
      },
      invalidatesTags: ["Server"],
    }),
  }),
});
```

---

## 6. Component Architecture

### 6.1 Component Organization

```
components/
├── ui/          → Re-exports from HeroUI (single source of truth)
├── custom/      → Non-HeroUI reusable components
├── layout/      → Structural/layout components
├── auth/        → Authentication guards
└── features/    → Feature-specific business logic components
```

### 6.2 Component Patterns

1. **UI Components**: Use HeroUI directly from `@/components/ui`
2. **Custom Components**: Wrap HeroUI with custom styling/logic
3. **Feature Components**: Encapsulate business logic, use hooks, call APIs

---

## 7. HeroUI v3 Integration

### 7.1 v3 Component Usage

All HeroUI v3 components follow the compound component pattern:

```typescript
// Modal
<Modal isOpen={isOpen} onClose={onClose}>
  <Modal.Backdrop />
  <Modal.Container>
    <Modal.Dialog>
      <Modal.Header>Title</Modal.Header>
      <Modal.Body>Content</Modal.Body>
      <Modal.Footer>Actions</Modal.Footer>
      <Modal.CloseTrigger />
    </Modal.Dialog>
  </Modal.Container>
</Modal>

// Dropdown
<Dropdown>
  <Dropdown.Trigger>
    <Button>Open</Button>
  </Dropdown.Trigger>
  <Dropdown.Content>
    <Dropdown.Item>Item 1</Dropdown.Item>
  </Dropdown.Content>
</Dropdown>

// Tooltip
<Tooltip content="Help text">
  <Button>Hover me</Button>
</Tooltip>

// Card
<Card>
  <Card.Content>Content</Card.Content>
  <Card.Footer>Footer</Card.Footer>
</Card>

// Form
<TextField>
  <Label>Email</Label>
  <Input type="email" />
  <FieldError />
</TextField>
```

### 7.2 HeroUI Components in Use

| Category   | Components                                            |
| ---------- | ----------------------------------------------------- |
| Buttons    | Button, ToggleButton, CloseButton                     |
| Forms      | Form, TextField, Input, TextArea, Label, FieldError   |
| Selectors  | Select, Checkbox, Switch, RadioGroup, Slider          |
| Display    | Avatar, Badge, Chip, Card, Table, ListBox             |
| Navigation | Tabs, Tab, Accordion, Link, Breadcrumbs               |
| Overlays   | Modal, Drawer, Dropdown, Popover, Tooltip, Alert      |
| Feedback   | Skeleton, Spinner, ProgressBar, ProgressCircle, Meter |
| Layout     | ScrollShadow, Kbd, Toolbar                            |

---

## 8. Type Definitions

### 8.1 Type Organization

| File               | Types                                                              |
| ------------------ | ------------------------------------------------------------------ |
| `api.types.ts`     | ApiResponse, PaginatedResponse                                     |
| `auth.types.ts`    | LoginRequest, RegisterRequest, AuthResponse                        |
| `user.types.ts`    | IUser, UserStatus, UserSettings                                    |
| `server.types.ts`  | IServer, IServerMember, IChannel, IRole, IChannelCategory, IInvite |
| `message.types.ts` | IMessage, MessageAttachment                                        |
| `socket.types.ts`  | SocketEvents, ServerToClientEvents, ClientToServerEvents           |

---

## 9. Routing & Navigation

### 9.1 Route Structure

```typescript
// Routes configuration
root
├── /login, /register, /forgot-password, etc. (guest-only)
├── /app (protected)
│   ├── /channels/me (DM)
│   │   └── /:userId
│   ├── /servers/:serverId
│   │   ├── /:channelId
│   │   └── /settings
│   └── /settings (user settings)
├── /invite/:code
└── /* (404)
```

### 9.2 Route Guards

- **AuthGuard**: Redirects to login if not authenticated
- **GuestGuard**: Redirects to app if already authenticated

---

## 10. Implementation Roadmap

### Phase 1: Foundation (Completed)

- [x] Set up React + Vite + TypeScript
- [x] Integrate HeroUI v3
- [x] Configure Redux Toolkit + RTK Query
- [x] Set up React Router DOM v6
- [x] Implement authentication flow (login, register, oauth)
- [x] Create base API with token refresh

### Phase 2: Core Features (In Progress)

- [x] Server sidebar with server list
- [x] Channel sidebar with categories
- [x] DM sidebar with friends
- [x] Channel chat view with message list
- [x] User settings page
- [ ] Server settings with role management
- [ ] Member sidebar with role assignment
- [ ] Server discovery page

### Phase 3: Enhancement (Pending)

- [ ] Role management UI
- [ ] Ban/Kick functionality
- [ ] Real-time presence updates
- [ ] Typing indicators
- [ ] Message reactions
- [ ] Channel category CRUD

### Phase 4: Polish (Pending)

- [ ] Loading states (skeletons)
- [ ] Error handling & toasts
- [ ] Mobile responsiveness
- [ ] Accessibility audit
- [ ] Performance optimization

---

## Appendix A: Key Files Reference

| File                                  | Purpose                              |
| ------------------------------------- | ------------------------------------ |
| `frontend/src/api/base_api.ts`        | RTK Query base with auth interceptor |
| `frontend/src/store/store.ts`         | Redux store configuration            |
| `frontend/src/components/ui/index.ts` | HeroUI re-exports                    |
| `frontend/src/routes/routes.tsx`      | Router definition                    |
| `frontend/src/types/server.types.ts`  | Server domain types                  |

---

## Appendix B: API Endpoints Reference

| Endpoint | File              | Description                              |
| -------- | ----------------- | ---------------------------------------- |
| Auth     | `auth_api.ts`     | login, register, refresh, logout, status |
| User     | `user_api.ts`     | profile, settings, avatar, status        |
| Server   | `server_api.ts`   | CRUD, members, invites, bans, discovery  |
| Channel  | `channel_api.ts`  | CRUD operations                          |
| Category | `category_api.ts` | Category management                      |
| Message  | `message_api.ts`  | Send, fetch, reactions                   |
| Friend   | `friend_api.ts`   | Friends, requests                        |
| DM       | `dm_api.ts`       | Direct messages                          |
| Role     | `role_api.ts`     | Role CRUD, permissions                   |

---

_Last Updated: April 2026_
