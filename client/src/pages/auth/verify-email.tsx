import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/auth.slice";
import { useGetAuthStatusQuery } from "@/api/auth.api";
import { PageLoader } from "@/components/custom/page-loader";

/**
 * FIX: OAuth token security
 *
 * The token arrives as a URL query param (?token=...) which means it appears in:
 *   - Browser history
 *   - Server access logs
 *   - Referrer headers sent to third parties
 *
 * We can't avoid the URL exposure (that's the OAuth redirect contract), but we
 * can limit persistence. The original code stored it in localStorage which is
 * permanent and XSS-accessible across all tabs and sessions.
 *
 * Changed to sessionStorage:
 *   - Tab-scoped: cleared when the tab closes
 *   - Not shared across tabs
 *   - Still XSS-accessible, but with a much smaller exposure window
 *
 * Ideal long-term fix: have the backend set an httpOnly cookie directly on the
 * OAuth callback redirect, then navigate to /auth/success with no token in the
 * URL. The getAuthStatus call would then validate the cookie instead.
 *
 * NOTE: auth.slice.ts reads localStorage.getItem("token") on init. For the
 * OAuth flow, the token is stored in sessionStorage here and then dispatched
 * to Redux via setCredentials. On a hard refresh the token won't be in
 * localStorage, so getAuthStatus (httpOnly cookie) must succeed to rehydrate.
 * If the backend issues httpOnly cookies on OAuth, this is already handled.
 * If not, accept that a hard refresh after OAuth login requires re-auth.
 */
export default function OAuthSuccess() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [params] = useSearchParams();
  const token = params.get("token");

  // FIX: store in sessionStorage (tab-scoped) instead of localStorage (permanent)
  useEffect(() => {
    if (token) sessionStorage.setItem("oauth_token", token);
  }, [token]);

  // getAuthStatus validates the session via httpOnly cookie or Bearer token
  const { data, isSuccess, isError } = useGetAuthStatusQuery();

  useEffect(() => {
    if (isSuccess && data?.data.isAuthenticated && data.data.user) {
      dispatch(setCredentials({ user: data.data.user, token: token ?? "" }));
      // Clean up URL param now that token is in Redux state
      navigate("/friends", { replace: true });
    }
    if (isError) {
      navigate("/login?error=oauth_failed", { replace: true });
    }
  }, [isSuccess, isError, data, dispatch, navigate, token]);

  return <PageLoader />;
}