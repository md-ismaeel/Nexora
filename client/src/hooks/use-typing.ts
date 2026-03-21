import { useCallback, useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket";
import { useAppSelector } from "@/store/hooks";
import { debounce } from "@/lib/utils/utils";

const TYPING_TIMEOUT = 3000; // ms

export function useTyping(channelId: string) {
    const connected = useAppSelector((s) => s.socket.connected);
    const isTyping = useRef(false);
    const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const stopTyping = useCallback(() => {
        if (!isTyping.current || !connected) return;
        isTyping.current = false;
        try {
            getSocket().emit("typing:stop", { channelId });
        } catch (error) {
            console.log("error", error);
        }
    }, [channelId, connected]);

    // Hold a stable ref to the debounced function so it isn't recreated on
    // every render (which would reset the debounce timer).
    const debouncedStartRef = useRef<ReturnType<typeof debounce> | null>(null);

    useEffect(() => {
        const fn = debounce(() => {
            if (!connected) return;
            if (!isTyping.current) {
                isTyping.current = true;
                try {
                    getSocket().emit("typing:start", { channelId });
                } catch (error) {
                    console.log("error", error)
                }
            }
            // Auto-stop after timeout
            if (stopTimer.current) clearTimeout(stopTimer.current);
            stopTimer.current = setTimeout(stopTyping, TYPING_TIMEOUT);
        }, 300);

        debouncedStartRef.current = fn;
    }, [channelId, connected, stopTyping]);

    const startTyping = useCallback(() => {
        debouncedStartRef.current?.();
    }, []);

    return { startTyping, stopTyping };
}