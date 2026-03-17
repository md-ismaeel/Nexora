import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { GuestGuard } from "@/components/auth/guest-guard";
import { suspend } from "./suspend";

// ── Layouts
const RootLayout = lazy(() => import("@/components/layout/Root-layout"));
const AuthLayout = lazy(() => import("@/components/layout/Auth-layout"));
const AppLayout = lazy(() => import("@/components/layout/App-layout"));

// ── Auth pages
const LoginPage = lazy(() => import("@/pages/auth/login"));
const RegisterPage = lazy(() => import("@/pages/auth/register"));
const VerifyEmail = lazy(() => import("@/pages/auth/verify-email"));
const OAuthSuccess = lazy(() => import("@/pages/auth/oauth-success"));

// ── App pages
const HomePage = lazy(() => import("@/pages/home"));
const ServerPage = lazy(() => import("@/pages/server"));
const ChannelPage = lazy(() => import("@/pages/channel"));
const DirectMessagePage = lazy(() => import("@/pages/direct-message"));
const FriendsPage = lazy(() => import("@/pages/friends"));
const SettingsPage = lazy(() => import("@/pages/settings"));
const NotFoundPage = lazy(() => import("@/pages/not-found"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: suspend(<RootLayout />),
    children: [
      // ── Public auth routes (redirect to app if already logged in)
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

      // ── Protected app routes
      {
        element: suspend(<AuthGuard />),
        children: [
          {
            element: suspend(<AppLayout />),
            children: [
              { index: true, element: <Navigate to="/friends" replace /> },
              { path: "friends", element: suspend(<FriendsPage />) },
              { path: "servers/:serverId", element: suspend(<ServerPage />) },
              {
                path: "servers/:serverId/:channelId",
                element: suspend(<ChannelPage />),
              },
              { path: "dm/:userId", element: suspend(<DirectMessagePage />) },
              { path: "settings", element: suspend(<SettingsPage />) },
            ],
          },
        ],
      },

      // ── Misc public routes
      { path: "verify-email", element: suspend(<VerifyEmail />) },
      { path: "auth/success", element: suspend(<OAuthSuccess />) },
      { path: "home", element: suspend(<HomePage />) },

      // ── 404
      { path: "*", element: suspend(<NotFoundPage />) },
    ],
  },
]);
