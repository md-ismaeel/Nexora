import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { useGetAuthStatusQuery } from "@/api/auth_api";
import { PageLoader } from "@/components/custom/page-loader";

/**
 * Blocks authenticated users from visiting auth pages (login, register).
 * - Redirects them back to wherever they came from, or /friends as default
 * - Shows loader while the boot session check is in-flight
 *
 * Security: the `from` value coming from location.state is user-controlled.
 * We sanitize it to only allow internal paths (must start with "/") to
 * prevent open redirect attacks where `from` could be "http://evil.com".
 */
export function GuestGuard() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAppSelector((s) => s.auth);

  useGetAuthStatusQuery();

  if (isLoading) return <PageLoader />;

  if (isAuthenticated) {
    const raw = (location.state as { from?: string })?.from;
    // FIX: only allow internal paths — reject anything that doesn't start with "/"
    const from = raw && raw.startsWith("/") ? raw : "/friends";
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
}

export default GuestGuard;