import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { useGetAuthStatusQuery } from "@/api/auth_api";
import { PageLoader } from "@/components/custom/page-loader";

export function AuthGuard() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAppSelector((s) => s.auth);
  useGetAuthStatusQuery();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

export default AuthGuard;