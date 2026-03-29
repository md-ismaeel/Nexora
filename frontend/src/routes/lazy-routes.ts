import { lazy } from "react";

// ── Layouts ───────────────────────────────────────────────────────────────────
export const RootLayout = lazy(() => import("@/components/layout/root-layout"));
export const AuthLayout = lazy(() => import("@/components/layout/auth-layout"));
export const AppLayout = lazy(() => import("@/components/layout/app-layout"));

// ── Auth guards ───────────────────────────────────────────────────────────────
export const AuthGuard = lazy(() => import("@/components/auth/auth-guard"));
export const GuestGuard = lazy(() => import("@/components/auth/guest-guard"));

// ── Auth pages ────────────────────────────────────────────────────────────────
export const LoginPage = lazy(() => import("@/pages/auth/login"));
export const RegisterPage = lazy(() => import("@/pages/auth/register"));
export const VerifyEmailPage = lazy(() => import("@/pages/auth/verify-email"));
export const VerifyPhonePage = lazy(() => import("@/pages/auth/veryfy-phone"));
export const OAuthSuccess = lazy(() => import("@/pages/auth/oauth-success"));

// ── App pages ─────────────────────────────────────────────────────────────────
export const HomePage = lazy(() => import("@/pages/home"));
// export const FriendsPage = lazy(() => import("@/pages/channesl/friends"));
// export const DirectMessagePage = lazy(() => import("@/pages/channesl/direct-message"));
// export const ServerPage = lazy(() => import("@/pages/servers/server"));
// export const ChannelPage = lazy(() => import("@/pages/channesl/channel"));
// export const ServerSettingsPage = lazy(() => import("@/pages/servers/server-settings"));
// export const InvitePage = lazy(() => import("@/pages/invite"));
// export const SettingsPage = lazy(() => import("@/pages/settings"));
export const NotFoundPage = lazy(() => import("@/pages/not-found"));