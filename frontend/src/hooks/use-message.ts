import { useAppSelector } from "@/store/hooks";

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
