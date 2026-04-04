import { createBrowserRouter } from "react-router-dom";
import { suspend } from "./suspend";
import { ErrorBoundary } from "@/components/custom/error-boundary";
import { RouteError } from "@/components/custom/route-error";
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
  ForgotPasswordPage,
  ResetPasswordPage,
  HomePage,
  FriendsPage,
  DMChatPage,
  ServerHomePage,
  ChannelPage,
  ServerSettingsPage,
  SettingsPage,
  InvitePage,
  NotFoundPage,
} from "@/routes/lazy-routes";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <ErrorBoundary>{suspend(<RootLayout />)}</ErrorBoundary>,
    errorElement: <RouteError />,
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
              { path: "forgot-password", element: suspend(<ForgotPasswordPage />) },
              { path: "reset-password", element: suspend(<ResetPasswordPage />) },
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
              { path: "channels/me", element: suspend(<FriendsPage />) },
              { path: "channels/me/:userId", element: suspend(<DMChatPage />) },
              { path: "servers/:serverId", element: suspend(<ServerHomePage />) },
              { path: "servers/:serverId/:channelId", element: suspend(<ChannelPage />) },
              { path: "servers/:serverId/settings", element: suspend(<ServerSettingsPage />) },
              { path: "settings", element: suspend(<SettingsPage />) },
            ],
          },
        ],
      },

      // ── 404 ────────────────────────────────────────────────────────────────
      { path: "*", element: suspend(<NotFoundPage />) },
    ],
  },
]);