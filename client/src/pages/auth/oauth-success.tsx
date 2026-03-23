import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/auth.slice";
import { useGetAuthStatusQuery } from "@/api/auth.api";
import { PageLoader } from "@/components/custom/page-loader";

/**
 * OAuthSuccessPage — landing page after OAuth redirect (/auth/success?token=).
 *
 * The token is tab-scoped in sessionStorage and also written to localStorage
 * so the auth.slice optimistic init picks it up on hard refresh until a proper
 * httpOnly-cookie-based flow is implemented.
 */
export default function OAuthSuccessPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [params] = useSearchParams();
  const token    = params.get("token");

  useEffect(() => {
    if (token) {
      sessionStorage.setItem("oauth_token", token);
      localStorage.setItem("token", token);
    }
  }, [token]);

  const { data, isSuccess, isError } = useGetAuthStatusQuery();

  useEffect(() => {
    if (isSuccess && data?.data.isAuthenticated && data.data.user) {
      dispatch(setCredentials({ user: data.data.user, token: token ?? "" }));
      navigate("/channels/@me", { replace: true });
    }
    if (isError) {
      navigate("/login?error=oauth_failed", { replace: true });
    }
  }, [isSuccess, isError, data, dispatch, navigate, token]);

  return <PageLoader message="Signing you in..." />;
}