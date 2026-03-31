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
export const ForgotPasswordPage = lazy(() => import("@/pages/auth/forgot-password"));
export const ResetPasswordPage = lazy(() => import("@/pages/auth/reset-password"));

// ── App pages ─────────────────────────────────────────────────────────────────
export const HomePage = lazy(() => import("@/pages/home"));
export const FriendsPage = lazy(() => import("@/pages/app/friends"));
export const DMChatPage = lazy(() => import("@/pages/app/dm-chat"));
export const ServerHomePage = lazy(() => import("@/pages/app/server-home"));
export const ChannelPage = lazy(() => import("@/pages/app/channel"));
export const ServerSettingsPage = lazy(() => import("@/pages/app/server-settings"));
export const SettingsPage = lazy(() => import("@/pages/app/settings"));
export const InvitePage = lazy(() => import("@/pages/invite"));
export const NotFoundPage = lazy(() => import("@/pages/not-found"));