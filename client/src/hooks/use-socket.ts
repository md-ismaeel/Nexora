import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
    setConnected,
    setDisconnected,
    setReconnecting,
    setSocketError,
} from "@/store/slices/socket_slice";
import {
    addMessage,
    updateMessage,
    removeMessage,
    setTyping,
    togglePinInCache,
} from "@/store/slices/message_slice";
import {
    addDm,
    updateDm,
    removeDm,
    incrementUnread,
    clearUnread,
    bumpConversation,
} from "@/store/slices/dm_slice";
import {
    addServer,
    removeServer,
    updateServerInList,
} from "@/store/slices/server_slice";
import { baseApi } from "@/api/base_api";
import type { IMessage } from "@/types/message.types";
import type { IDirectMessage } from "@/types/message.types";
import type { IServer } from "@/types/server.types";

const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL ?? "http://localhost:5000";

/**
 * useSocket — manages the Socket.IO connection lifecycle.
 *
 * Lifecycle:
 *   - Connects when the user is authenticated
 *   - Joins all server rooms on connect
 *   - Tears down on logout (token becomes null)
 *
 * Call once at the top of AppLayout so the socket is alive for
 * the entire authenticated session.
 */
export function useSocket() {
    const dispatch = useAppDispatch();
    const token = useAppSelector((s) => s.auth.token);
    const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
    const servers = useAppSelector((s) => s.server.servers);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !token) {
            // Tear down existing connection on logout
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                dispatch(setDisconnected());
            }
            return;
        }

        // Prevent double-connecting in StrictMode
        if (socketRef.current?.connected) return;

        const socket = io(SOCKET_URL, {
            auth: { token },
            transports: ["websocket", "polling"],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 10_000,
        });

        socketRef.current = socket;

        // ── Connection lifecycle ───────────────────────────────────────────────

        socket.on("connect", () => {
            dispatch(setConnected({ socketId: socket.id ?? "" }));
            // Re-join server rooms after reconnect
            servers.forEach((s) => socket.emit("join:server", s._id));
        });

        socket.on("disconnect", () => dispatch(setDisconnected()));

        socket.on("connect_error", (err) =>
            dispatch(setSocketError(err.message)),
        );

        socket.on("reconnect_attempt", () => dispatch(setReconnecting(true)));

        socket.on("reconnect", () => dispatch(setReconnecting(false)));

        // ── Channel message events ─────────────────────────────────────────────

        socket.on(
            "message:created",
            ({ message }: { message: IMessage }) => {
                dispatch(addMessage(message));
                // Invalidate RTK Query cache so pinned / search views stay fresh
                dispatch(
                    baseApi.util.invalidateTags([
                        { type: "Message", id: message.channel as string },
                    ]),
                );
            },
        );

        socket.on(
            "message:updated",
            ({ message }: { message: IMessage }) => dispatch(updateMessage(message)),
        );

        socket.on(
            "message:deleted",
            ({ messageId, channelId }: { messageId: string; channelId: string }) =>
                dispatch(removeMessage({ messageId, channelId })),
        );

        socket.on(
            "message:pinned",
            ({
                message,
                isPinned,
            }: {
                message: IMessage;
                isPinned: boolean;
            }) =>
                dispatch(
                    togglePinInCache({
                        messageId: message._id,
                        channelId: message.channel as string,
                        isPinned,
                    }),
                ),
        );

        // ── Typing indicators ──────────────────────────────────────────────────

        socket.on(
            "typing:start",
            ({ channelId, userId }: { channelId: string; userId: string }) =>
                dispatch(setTyping({ channelId, userId, isTyping: true })),
        );

        socket.on(
            "typing:stop",
            ({ channelId, userId }: { channelId: string; userId: string }) =>
                dispatch(setTyping({ channelId, userId, isTyping: false })),
        );

        // ── Direct message events ──────────────────────────────────────────────

        socket.on(
            "dm:received",
            ({ message }: { message: IDirectMessage }) => {
                const senderId =
                    typeof message.sender === "string"
                        ? message.sender
                        : (message.sender as { _id: string })._id;
                dispatch(addDm({ userId: senderId, message }));
                dispatch(incrementUnread(senderId));
                dispatch(bumpConversation({ userId: senderId, lastMessage: message }));
                // Invalidate DM cache
                dispatch(
                    baseApi.util.invalidateTags([
                        { type: "DirectMessage", id: senderId },
                    ]),
                );
            },
        );

        socket.on(
            "dm:sent",
            ({ message }: { message: IDirectMessage }) => {
                const receiverId =
                    typeof message.receiver === "string"
                        ? message.receiver
                        : (message.receiver as { _id: string })._id;
                dispatch(addDm({ userId: receiverId, message }));
            },
        );

        socket.on(
            "dm:updated",
            ({ message }: { message: IDirectMessage }) => {
                const otherId =
                    typeof message.sender === "string"
                        ? message.sender
                        : (message.sender as { _id: string })._id;
                dispatch(updateDm({ userId: otherId, message }));
            },
        );

        socket.on(
            "dm:deleted",
            ({
                messageId,
                deletedBy,
            }: {
                messageId: string;
                deletedBy: string;
            }) => dispatch(removeDm({ userId: deletedBy, messageId })),
        );

        socket.on(
            "dm:read",
            ({ readBy }: { readBy: string }) => dispatch(clearUnread(readBy)),
        );

        // ── Server membership events ───────────────────────────────────────────

        socket.on(
            "server:joined",
            ({ server }: { server: IServer }) => {
                dispatch(addServer(server));
                socket.emit("join:server", server._id);
            },
        );

        socket.on(
            "member:joined",
            () =>
                dispatch(baseApi.util.invalidateTags([{ type: "Server" as const }])),
        );

        socket.on(
            "member:left",
            () =>
                dispatch(baseApi.util.invalidateTags([{ type: "Server" as const }])),
        );

        // ── Channel events ─────────────────────────────────────────────────────

        socket.on(
            "channel:created",
            ({ channel }: { channel: { server: string } }) =>
                dispatch(
                    baseApi.util.invalidateTags([
                        { type: "Channel" as const, id: channel.server },
                    ]),
                ),
        );

        socket.on(
            "channel:updated",
            ({ channel }: { channel: { server: string; _id: string } }) =>
                dispatch(
                    baseApi.util.invalidateTags([
                        { type: "Channel" as const, id: channel._id },
                        { type: "Channel" as const, id: channel.server },
                    ]),
                ),
        );

        socket.on(
            "channel:deleted",
            ({ channelId }: { channelId: string }) =>
                dispatch(
                    baseApi.util.invalidateTags([
                        { type: "Channel" as const, id: channelId },
                    ]),
                ),
        );

        // ── Cleanup ────────────────────────────────────────────────────────────

        return () => {
            socket.removeAllListeners();
            socket.disconnect();
            socketRef.current = null;
        };
    }, [isAuthenticated, token]); // eslint-disable-line react-hooks/exhaustive-deps

    // Re-join server rooms when the server list changes
    useEffect(() => {
        const socket = socketRef.current;
        if (!socket?.connected || servers?.length === 0) return;
        servers?.forEach((s) => socket.emit("join:server", s._id));
    }, [servers]);

    return socketRef.current;
}