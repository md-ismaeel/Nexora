import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { useGetAuthStatusQuery } from "@/api/auth.api";
import { PageLoader } from "@/components/custom/page-loader";

/**
 * Protects routes that require authentication.
 *
 * Boot sequence:
 *   1. auth.slice initializes isAuthenticated = !!storedToken (optimistic)
 *   2. isLoading starts true — we show <PageLoader /> while /auth/status runs
 *   3. getAuthStatus resolves → setCredentials (valid) or clearCredentials (expired)
 *   4. isLoading goes false → guard renders <Outlet /> or redirects to /login
 *
 * IMPORTANT: always check isLoading BEFORE isAuthenticated.
 * With the optimistic init in auth.slice, isAuthenticated starts true when a
 * token exists in localStorage. If we skipped the isLoading check, a user
 * with an expired token would briefly see protected content before the status
 * check returns and clears credentials.
 *
 * The `from` path is forwarded to /login so we can redirect back after login.
 */
export function AuthGuard() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAppSelector((s) => s.auth);

  // Rehydrate session from httpOnly cookie / validate stored JWT on first load.
  // RTK Query deduplicates this — it will only fire once per cache window
  // even though both AuthGuard and GuestGuard call it.
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

export default AuthGuard;