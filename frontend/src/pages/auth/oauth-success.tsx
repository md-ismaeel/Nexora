import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/auth_slice";
import { useGetAuthStatusQuery } from "@/api/auth_api";
import { Spinner } from "@heroui/react";

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
  const token = params.get("token");

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" color="accent" />
        <p className="text-sm font-medium tracking-wide text-muted">
          Signing you in...
        </p>
      </div>
    </div>
  );
}