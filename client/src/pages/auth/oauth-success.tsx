import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/auth_slice";
import { useGetAuthStatusQuery } from "@/api/auth_api";
import { PageLoader } from "@/components/custom/page-loader";

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [params] = useSearchParams();
  const token = params.get("token");

  // Persist token so the auth header interceptor can use it
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
  }, [token]);

  const { data, isSuccess, isError } = useGetAuthStatusQuery();

  useEffect(() => {
    if (isSuccess && data?.data.isAuthenticated && data.data.user) {
      dispatch(setCredentials({ user: data.data.user, token: token ?? "" }));
      navigate("/friends", { replace: true });
    }
    if (isError) {
      navigate("/login?error=oauth_failed", { replace: true });
    }
  }, [isSuccess, isError, data, dispatch, navigate, token]);

  return <PageLoader />;
}