import { lazy } from "react";

// ── Layouts
export const RootLayout = lazy(() => import("@/components/layout/root-layout"));
export const AuthLayout = lazy(() => import("@/components/layout/auth-layout"));
export const AppLayout = lazy(() => import("@/components/layout/app-layout"));

// ── Auth guards
// Both use default exports so lazy() wraps them correctly.
// RTK Query deduplicates the getAuthStatus call even though both guards call it.
export const AuthGuard = lazy(() => import("@/components/auth/auth-guard"));
export const GuestGuard = lazy(() => import("@/components/auth/guest-guard"));

// ── Auth pages
export const LoginPage = lazy(() => import("@/pages/auth/login"));
export const RegisterPage = lazy(() => import("@/pages/auth/register"));
export const VerifyEmail = lazy(() => import("@/pages/auth/verify-email"));
export const OAuthSuccess = lazy(() => import("@/pages/auth/oauth-success"));

// ── App pages
export const HomePage = lazy(() => import("@/pages/home"));
export const FriendsPage = lazy(() => import("@/pages/friends"));
export const ServerPage = lazy(() => import("@/pages/server"));
export const ChannelPage = lazy(() => import("@/pages/channel"));
export const DirectMessagePage = lazy(() => import("@/pages/direct-message"));
export const SettingsPage = lazy(() => import("@/pages/settings"));
export const NotFoundPage = lazy(() => import("@/pages/not-found"));