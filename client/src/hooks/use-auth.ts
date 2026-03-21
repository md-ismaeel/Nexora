import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearCredentials } from "@/store/slices/auth.slice";
import { useLogoutMutation } from "@/api/auth.api";
import { useNavigate } from "react-router-dom";
import { disconnectSocket } from "@/lib/socket";

export function useAuth() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [logoutMutation] = useLogoutMutation();

    const { user, token, isAuthenticated, isLoading } = useAppSelector((s) => s.auth);

    const logout = async () => {
        try {
            await logoutMutation().unwrap();
        } catch {
            // Even if API call fails, clear client state
        } finally {
            disconnectSocket();
            dispatch(clearCredentials());
            navigate("/login", { replace: true });
        }
    };

    return { user, token, isAuthenticated, isLoading, logout };
}