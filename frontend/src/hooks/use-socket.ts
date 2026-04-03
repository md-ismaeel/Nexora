import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { io, type Socket } from "socket.io-client";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import type { RootState } from "@/store/store";
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
} from "@/store/slices/server_slice";
import { baseApi } from "@/api/base_api";
import type { IMessage } from "@/types/message.types";
import type { IDirectMessage } from "@/types/message.types";
import type { IServer } from "@/types/server.types";

const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL ?? "http://localhost:5000";

export function useSocket(): Socket | null {
    const dispatch = useAppDispatch();
    const token = useAppSelector((s: RootState) => s.auth.token);
    const isAuthenticated = useAppSelector((s: RootState) => s.auth.isAuthenticated);
    const servers = useAppSelector((s: RootState) => s.server.servers);
    const socketRef = useRef<Socket | null>(null);
    const [, forceUpdate] = useState(0);

    const serversRef = useRef(servers);
    useEffect(() => {
        serversRef.current = servers;
    }, [servers]);

    useEffect(() => {
        if (!isAuthenticated || !token) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                dispatch(setDisconnected());
                forceUpdate(n => n + 1);
            }
            return;
        }

        if (socketRef.current?.connected) return;

        const socket = io(SOCKET_URL, {
            auth: { token },
            transports: ["websocket", "polling"],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 10_000,
        });

        socketRef.current = socket;
        forceUpdate(n => n + 1);

        socket.on("connect", () => {
            dispatch(setConnected({ socketId: socket.id ?? "" }));
            serversRef.current.forEach((s) => socket.emit("join:server", s._id));
        });

        socket.on("disconnect", () => dispatch(setDisconnected()));

        socket.on("connect_error", (err: Error) =>
            dispatch(setSocketError(err.message)),
        );

        socket.on("reconnect_attempt", () => dispatch(setReconnecting(true)));

        socket.on("reconnect", () => dispatch(setReconnecting(false)));

        socket.on(
            "message:created",
            ({ message }: { message: IMessage }) => {
                dispatch(addMessage(message));
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
            ({ message, isPinned }: { message: IMessage; isPinned: boolean }) =>
                dispatch(
                    togglePinInCache({
                        messageId: message._id,
                        channelId: message.channel as string,
                        isPinned,
                    }),
                ),
        );

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
            ({ messageId, deletedBy }: { messageId: string; deletedBy: string }) => dispatch(removeDm({ userId: deletedBy, messageId })),
        );

        socket.on(
            "dm:read",
            ({ readBy }: { readBy: string }) => dispatch(clearUnread(readBy)),
        );

        socket.on(
            "server:joined",
            ({ server }: { server: IServer }) => {
                dispatch(addServer(server));
                socket.emit("join:server", server._id);
            },
        );

        socket.on(
            "member:joined",
            () => dispatch(baseApi.util.invalidateTags([{ type: "Server" as const }])),
        );

        socket.on(
            "member:left",
            () => dispatch(baseApi.util.invalidateTags([{ type: "Server" as const }])),
        );

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

        return () => {
            socket.removeAllListeners();
            socket.disconnect();
            socketRef.current = null;
            forceUpdate(n => n + 1);
        };
    }, [isAuthenticated, token, dispatch]);

    useEffect(() => {
        const socket = socketRef.current;
        if (!socket?.connected || servers?.length === 0) return;
        servers?.forEach((s) => socket.emit("join:server", s._id));
    }, [servers]);

    return useSyncExternalStore(
        (onStoreChange: () => void) => {
            const handleChange = () => onStoreChange();
            socketRef.current?.on("connect", handleChange);
            socketRef.current?.on("disconnect", handleChange);
            return () => {
                socketRef.current?.off("connect", handleChange);
                socketRef.current?.off("disconnect", handleChange);
            };
        },
        () => socketRef.current,
        () => null
    );
}