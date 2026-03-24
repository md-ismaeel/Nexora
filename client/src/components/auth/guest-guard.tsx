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
    const raw = (location.state as { from?: string })?.from;
    const from = raw && raw.startsWith("/") ? raw : "/channels/me";
    return <Navigate to={from} replace />;
  }
  return <Outlet />;
}

export default GuestGuard;