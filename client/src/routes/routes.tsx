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
              { path: "servers/:serverId/:channelId", element: suspend(<ChannelPage />) },
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