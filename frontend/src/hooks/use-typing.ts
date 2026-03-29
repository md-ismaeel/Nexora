import { useCallback, useRef } from "react";
import { useSocket } from "@/hooks/use-socket";

const STOP_DELAY_MS = 2500; // stop indicator 2.5s after last keystroke

/**
 * useTyping — emits socket typing events for a given channel.
 *
 * Usage:
 *   const { startTyping, stopTyping } = useTyping(channelId)
 *
 *   Call startTyping() in the textarea onChange / onKeyDown handler.
 *   Call stopTyping() before sending the message.
 *
 * Auto-stops after STOP_DELAY_MS of inactivity so indicators don't
 * linger if the user stops typing without sending.
 */
export function useTyping(channelId: string) {
  const socket = useSocket();
  const isTypingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopTyping = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      socket?.emit("typing:stop", { channelId });
    }
  }, [socket, channelId]);

  const startTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket?.emit("typing:start", { channelId });
    }
    // Reset the auto-stop timer on every keystroke
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(stopTyping, STOP_DELAY_MS);
  }, [socket, channelId, stopTyping]);

  return { startTyping, stopTyping };
}