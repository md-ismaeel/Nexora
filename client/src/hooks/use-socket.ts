import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { initSocket, disconnectSocket, getSocket } from "@/lib/socket";

/**
 * Call once at the app root (inside AuthGuard or AppLayout).
 * Connects socket when user is authenticated, disconnects on logout.
 */
export function useSocket() {
    const { token, isAuthenticated } = useAppSelector((s) => s.auth);

    useEffect(() => {
        if (isAuthenticated && token) {
            initSocket(token);
        }
        return () => {
            disconnectSocket();
        };
    }, [isAuthenticated, token]);

    return { getSocket };
}