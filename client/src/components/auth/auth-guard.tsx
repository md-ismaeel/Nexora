import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { useGetAuthStatusQuery } from "@/api/auth.api";
import { PageLoader } from "@/components/custom/page-loader";

/**
 * Protects routes that require authentication.
 * - Shows loader while session check is in-flight
 * - Saves the attempted URL so we can redirect back after login
 * - Renders <Outlet /> once authenticated
 */
export default function AuthGuard() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAppSelector((s) => s.auth);

  // Rehydrate session from httpOnly cookie on first load
  useGetAuthStatusQuery();

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}