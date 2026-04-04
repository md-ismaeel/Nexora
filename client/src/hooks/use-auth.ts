import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearCredentials } from "@/store/slices/auth_slice";
import { clearAllMessages } from "@/store/slices/message_slice";
import { clearAllDms } from "@/store/slices/dm_slice";
import { useLogoutMutation } from "@/api/auth_api";
import type { IUser } from "@/types/user.types";

interface UseAuthReturn {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
}

/**
 * useAuth — primary hook for auth state and logout.
 *
 * Logout flow:
 *   1. Call POST /auth/logout (blacklists token on server)
 *   2. Clear Redux auth + message + dm slices
 *   3. Navigate to /login
 *
 * All of this happens regardless of whether the API call succeeds —
 * the local state is cleared in the finally block.
 */
export function useAuth(): UseAuthReturn {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logoutApi] = useLogoutMutation();

  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const isLoading = useAppSelector((s) => s.auth.isLoading);

  const logout = useCallback(async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // Server logout failed (expired token, network error, etc.)
      // Still clear local state so the user isn't stuck
    } finally {
      dispatch(clearCredentials());
      dispatch(clearAllMessages());
      dispatch(clearAllDms());
      navigate("/login", { replace: true });
    }
  }, [logoutApi, dispatch, navigate]);

  return { user, token, isAuthenticated, isLoading, logout };
}