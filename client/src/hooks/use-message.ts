import { useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useGetMessagesQuery } from "@/api/message_api";
import { prependMessages } from "@/store/slices/message_slice";

const DEFAULT_LIMIT = 50;

interface UseMessagesOptions {
    channelId: string | undefined;
}

interface UseMessagesReturn {
    messages: ReturnType<
        typeof useAppSelector<
            ReturnType<
                typeof import("@/store/slices/message_slice").selectChannelMessages
            >
        >
    >;
    isLoading: boolean;
    isFetching: boolean;
    hasMore: boolean;
    loadMore: () => void;
}

/**
 * useMessages — combines RTK Query initial load with Redux slice
 * for real-time socket updates, and provides a loadMore() function
 * for infinite scroll (loads older messages via cursor-based pagination).
 *
 * The Redux slice is the single source of truth after initial load.
 * socket-pushed messages are appended by use-socket.ts directly.
 */
export function useMessages({ channelId }: UseMessagesOptions) {
    const dispatch = useAppDispatch();
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // Initial load — seeds the Redux slice via onQueryStarted
    const { isLoading, isFetching } = useGetMessagesQuery(
        { channelId: channelId! },
        { skip: !channelId },
    );

    // Messages come from the slice (includes real-time updates)
    const messages = useAppSelector(
        (s) => s.message.byChannel[channelId ?? ""] ?? [],
    );

    // Load older messages (infinite scroll — scroll to top)
    const loadMore = useCallback(async () => {
        if (!channelId || loadingMore || !hasMore) return;
        setLoadingMore(true);
        const nextPage = page + 1;
        try {
            const result = await dispatch(
                // Trigger the query imperatively so we can inspect the response
                import("@/api/message_api").then(({ messageApi }) =>
                    dispatch(
                        messageApi.endpoints.getMessages.initiate(
                            { channelId, page: nextPage, limit: DEFAULT_LIMIT },
                            { forceRefetch: true },
                        ),
                    ),
                ),
            );
            const data = (
                result as {
                    data?: {
                        data?: { messages?: unknown[]; pagination?: { hasMore?: boolean } };
                    };
                }
            ).data;
            const incoming = data?.data?.messages ?? [];
            if (incoming.length > 0) {
                dispatch(
                    prependMessages({
                        channelId,
                        messages: incoming as Parameters<
                            typeof prependMessages
                        >[0]["payload"]["messages"],
                    }),
                );
            }
            const more = data?.data?.pagination?.hasMore ?? false;
            setHasMore(more);
            if (more) setPage(nextPage);
        } finally {
            setLoadingMore(false);
        }
    }, [channelId, dispatch, loadingMore, hasMore, page]);

    return {
        messages,
        isLoading,
        isFetching: isFetching || loadingMore,
        hasMore,
        loadMore,
    };
}
