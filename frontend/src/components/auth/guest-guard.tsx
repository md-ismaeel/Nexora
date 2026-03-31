// guest-guard.tsx
// Protects guest-only routes (login, register).
// Authenticated users are redirected back to their prior location or home.
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { useGetAuthStatusQuery } from "@/api/auth_api";
import { PageLoader } from "@/components/custom/page-loader";

export function GuestGuard() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAppSelector((s) => s.auth);
  useGetAuthStatusQuery();

  if (isLoading) return <PageLoader />;
  if (isAuthenticated) {
    const from = (location.state as { from?: string })?.from;
    return <Navigate to={from?.startsWith("/") ? from : "/channels"} replace />;
  }
  return <Outlet />;
}

export default GuestGuard;