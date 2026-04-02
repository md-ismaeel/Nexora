import { useAppSelector } from "@/store/hooks";

const DEFAULT_LIMIT = 50;

interface UseMessagesOptions {
    channelId: string | undefined;
}

export function useMessages({ channelId }: UseMessagesOptions) {
    const messages = useAppSelector(
        (s) => (channelId ? s.message.byChannel[channelId] ?? [] : []),
    );

    return {
        messages,
        isLoading: false,
        isFetching: false,
        hasMore: false,
        loadMore: () => {},
    };
}
