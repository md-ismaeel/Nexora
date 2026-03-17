import { io, type Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "@/types/socket.types";
import { store } from "@/store/store";
import { setConnected, setReconnecting } from "@/store/slices/socket.slice";

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: AppSocket | null = null;

export const getSocket = (): AppSocket => {
  if (!socket) {
    throw new Error("Socket not initialised. Call initSocket() first.");
  }
  return socket;
};

export const initSocket = (token: string): AppSocket => {
  // Tear down any existing connection first
  if (socket) {
    socket.disconnect();
  }

  socket = io(import.meta.env.VITE_SOCKET_URL ?? "http://localhost:5000", {
    withCredentials: true,
    auth:            { token },
    transports:      ["websocket", "polling"],
    reconnection:       true,
    reconnectionDelay:  1000,
    reconnectionAttempts: 5,
  });

  // ── Lifecycle events → Redux
  socket.on("connect", () => {
    console.log("[socket] connected:", socket!.id);
    store.dispatch(setConnected(true));
  });

  socket.on("disconnect", (reason) => {
    console.log("[socket] disconnected:", reason);
    store.dispatch(setConnected(false));
  });

  socket.on("connect_error", (err) => {
    console.error("[socket] connect error:", err.message);
    store.dispatch(setReconnecting(true));
  });

  socket.io.on("reconnect_attempt", () => {
    store.dispatch(setReconnecting(true));
  });

  socket.io.on("reconnect", () => {
    store.dispatch(setConnected(true));
  });

  socket.io.on("reconnect_failed", () => {
    store.dispatch(setReconnecting(false));
    store.dispatch(setConnected(false));
  });

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};