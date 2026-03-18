import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { useGetAuthStatusQuery } from "@/api/auth.api";
import { PageLoader } from "@/components/custom/page-loader";

/**
 * Blocks authenticated users from visiting auth pages (login, register).
 * - Redirects them back to wherever they came from, or /friends as default
 * - Shows loader while session check is in-flight
 */
export default function GuestGuard() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAppSelector((s) => s.auth);

  useGetAuthStatusQuery();

  if (isLoading) return <PageLoader />;

  if (isAuthenticated) {
    const from = (location.state as { from?: string })?.from ?? "/friends";
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
}