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
  VerifyEmailPage,
  VerifyPhonePage,
  OAuthSuccess,
  HomePage,
  FriendsPage,
  DirectMessagePage,
  ServerPage,
  ChannelPage,
  ServerSettingsPage,
  InvitePage,
  SettingsPage,
  NotFoundPage,
} from "./lazy-routes";

/**
 * Route tree — matches Discord's URL structure:
 *
 *  /                               Landing page
 *  /login, /register               Auth pages (guest-only)
 *  /verify-email, /verify-phone    Post-register verification
 *  /auth/success                   OAuth landing
 *  /invite/:code                   Public invite preview
 *
 *  /channels/@me                   Friends + DM list   (auth required)
 *  /channels/@me/:userId           DM conversation     (auth required)
 *
 *  /servers/:serverId              Server (auto-redirects to first channel)
 *  /servers/:serverId/:channelId   Channel view
 *  /servers/:serverId/settings     Server settings (owner/admin)
 *
 *  /settings                       User settings
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: suspend(<RootLayout />),
    children: [
      // ── Public landing ──────────────────────────────────────────────────────
      { index: true, element: suspend(<HomePage />) },

      // ── Guest-only auth pages ───────────────────────────────────────────────
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

      // ── Semi-public (no guard — reached right after register) ───────────────
      { path: "verify-email", element: suspend(<VerifyEmailPage />) },
      { path: "verify-phone", element: suspend(<VerifyPhonePage />) },
      { path: "auth/success", element: suspend(<OAuthSuccess />) },

      // ── Public invite preview ───────────────────────────────────────────────
      { path: "invite/:code", element: suspend(<InvitePage />) },

      // ── Protected app routes ────────────────────────────────────────────────
      {
        element: suspend(<AuthGuard />),
        children: [
          {
            element: suspend(<AppLayout />),
            children: [
              // /  → /channels/@me
              { index: true, element: <Navigate to="/channels/@me" replace /> },

              // DMs & Friends
              { path: "channels/@me", element: suspend(<FriendsPage />) },
              {
                path: "channels/@me/:userId",
                element: suspend(<DirectMessagePage />),
              },

              // Servers
              {
                path: "servers/:serverId",
                element: suspend(<ServerPage />),
                children: [
                  { path: ":channelId", element: suspend(<ChannelPage />) },
                ],
              },

              // Server settings (separate layout, no channel sidebar needed)
              {
                path: "servers/:serverId/settings",
                element: suspend(<ServerSettingsPage />),
              },

              // User settings
              { path: "settings", element: suspend(<SettingsPage />) },
              { path: "settings/:tab", element: suspend(<SettingsPage />) },
            ],
          },
        ],
      },

      // ── 404 ────────────────────────────────────────────────────────────────
      { path: "*", element: suspend(<NotFoundPage />) },
    ],
  },
]);
