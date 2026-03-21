import { createBrowserRouter, Navigate } from "react-router-dom";
import { suspend } from "./suspend";
import {
  RootLayout,
  AuthLayout,
  AppLayout,
  AuthGuard,
  GuestGuard,
  LoginPage,
  RegisterPage,
  VerifyEmail,
  OAuthSuccess,
  HomePage,
  FriendsPage,
  ServerPage,
  ChannelPage,
  DirectMessagePage,
  SettingsPage,
  NotFoundPage,
} from "./lazy-routes";

/**
 * Route tree overview:
 *
 *  /                            RootLayout
 *  ├── (GuestGuard)             blocks authenticated users from auth pages
 *  │   └── (AuthLayout)
 *  │       ├── login
 *  │       └── register
 *  │
 *  ├── (AuthGuard)              requires authentication
 *  │   └── (AppLayout)         server rail + channel sidebar + main content
 *  │       ├── /               → redirect /friends
 *  │       ├── friends
 *  │       ├── servers/:serverId          ServerPage (auto-redirects to first channel)
 *  │       │   └── :channelId            ChannelPage rendered via <Outlet /> in ServerPage
 *  │       ├── dm/:userId
 *  │       └── settings
 *  │
 *  ├── verify-email             outside guards — needed right after register
 *  ├── auth/success             OAuth callback landing page
 *  ├── home                     public marketing / landing page
 *  └── *                        404
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: suspend(<RootLayout />),
    children: [

      // ── Public auth pages (GuestGuard redirects logged-in users away) ──────
      {
        element: suspend(<GuestGuard />),
        children: [
          {
            element: suspend(<AuthLayout />),
            children: [
              { path: "login", element: suspend(<LoginPage />) },
              { path: "register", element: suspend(<RegisterPage />) },
            ],
          },
        ],
      },

      // ── Protected app routes ───────────────────────────────────────────────
      {
        element: suspend(<AuthGuard />),
        children: [
          {
            element: suspend(<AppLayout />),
            children: [
              // Default: redirect / → /friends
              { index: true, element: <Navigate to="/friends" replace /> },

              { path: "friends", element: suspend(<FriendsPage />) },
              { path: "dm/:userId", element: suspend(<DirectMessagePage />) },
              { path: "settings", element: suspend(<SettingsPage />) },

              // FIX: ServerPage is now the PARENT of ChannelPage.
              // Previously both were sibling routes, which meant:
              //   - ServerPage's <Outlet /> never rendered anything (no children defined)
              //   - The auto-redirect logic in ServerPage never ran when navigating
              //     directly to /servers/:serverId/:channelId
              //
              // Now:
              //   /servers/:serverId         → ServerPage (handles auto-redirect)
              //   /servers/:serverId/:channelId → ServerPage + ChannelPage via <Outlet />
              {
                path: "servers/:serverId",
                element: suspend(<ServerPage />),
                children: [
                  {
                    path: ":channelId",
                    element: suspend(<ChannelPage />),
                  },
                ],
              },
            ],
          },
        ],
      },

      // ── Misc public routes ─────────────────────────────────────────────────

      // verify-email is intentionally outside both guards:
      // the user arrives here right after register, before email is verified,
      // so they won't pass the AuthGuard yet.
      { path: "verify-email", element: suspend(<VerifyEmail />) },

      // OAuth callback — sets credentials then navigates to /friends
      { path: "auth/success", element: suspend(<OAuthSuccess />) },

      // Public landing / marketing page
      { path: "home", element: suspend(<HomePage />) },

      // 404 catch-all
      { path: "*", element: suspend(<NotFoundPage />) },
    ],
  },
]);