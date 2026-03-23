import { useParams } from "react-router-dom";
import { useGetPinnedMessagesQuery, useTogglePinMessageMutation } from "@/api/message_api";
import { UserAvatar } from "@/components/custom/user-avatar";
import { formatMessageTime } from "@/lib/utils/utils";
import { isPopulatedUser } from "@/types/message.types";
import { motion, AnimatePresence, Modals, vp, makeStagger, Primitives } from "@/lib/motion";
import { ChatIcons, UIIcons } from "@/lib/lucide";
import type { IMessage } from "@/types/message.types";

interface PinnedMessagesProps {
    onClose: () => void;
}

function PinnedItem({
    msg,
    onUnpin,
    unpinning,
}: {
    msg: IMessage;
    onUnpin: () => void;
    unpinning: boolean;
}) {
    const author = msg.author;
    const name = isPopulatedUser(author) ? (author.username ?? author.name) : "Unknown";
    const avatar = isPopulatedUser(author) ? author.avatar : undefined;

    return (
        <motion.div
            variants={Primitives.slideUp}
            className="group relative rounded-lg bg-[#2b2d31] p-3 hover:bg-[#35363c] transition-colors"
        >
            {/* Unpin button */}
            <button
                onClick={onUnpin}
                disabled={unpinning}
                title="Unpin message"
                className="absolute right-2 top-2 hidden rounded p-1 text-[#949ba4] hover:text-[#ed4245] transition-colors group-hover:flex items-center"
            >
                <ChatIcons.Unpin className="h-4 w-4" />
            </button>

            {/* Author */}
            <div className="flex items-start gap-2">
                <UserAvatar name={name} avatar={avatar} size="sm" className="mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-[#dbdee1]">{name}</span>
                        <span className="text-[10px] text-[#4e5058]">
                            {formatMessageTime(msg.createdAt)}
                        </span>
                    </div>
                    <p className="mt-0.5 break-words text-sm text-[#dbdee1] line-clamp-3">
                        {msg.content}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

export function PinnedMessages({ onClose }: PinnedMessagesProps) {
    const { channelId } = useParams<{ channelId: string }>();
    const { data, isLoading, isError } = useGetPinnedMessagesQuery(channelId!, {
        skip: !channelId,
    });
    const [togglePin, { isLoading: toggling }] = useTogglePinMessageMutation();

    const messages = data?.data.messages ?? [];

    return (
        <motion.div
            {...vp(Modals.sideSheet)}
            className="flex h-full w-80 shrink-0 flex-col border-l border-[#3f4147] bg-[#2b2d31]"
        >
            {/* Header */}
            <div className="flex h-12 shrink-0 items-center justify-between px-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <ChatIcons.Pin className="h-4 w-4 text-[#949ba4]" />
                    <span className="font-semibold text-white">Pinned Messages</span>
                </div>
                <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-[#949ba4] hover:text-white transition-colors"
                >
                    <UIIcons.Close className="h-5 w-5" />
                </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-thin scrollbar-thumb-[#1e1f22]">
                {isLoading && (
                    <div className="flex justify-center py-8">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#5865f2] border-t-transparent" />
                    </div>
                )}

                {isError && (
                    <p className="py-8 text-center text-sm text-[#ed4245]">
                        Failed to load pinned messages.
                    </p>
                )}

                {!isLoading && !isError && messages.length === 0 && (
                    <div className="flex flex-col items-center gap-3 py-12 text-center">
                        <ChatIcons.Pin className="h-12 w-12 text-[#4e5058]" />
                        <p className="text-sm font-semibold text-[#dbdee1]">No pins yet</p>
                        <p className="text-xs text-[#949ba4]">
                            Pin important messages so they're easy to find.
                        </p>
                    </div>
                )}

                <AnimatePresence>
                    <motion.div
                        variants={makeStagger({ staggerChildren: 0.04 })}
                        initial="hidden"
                        animate="visible"
                        className="space-y-2"
                    >
                        {messages.map((msg) => (
                            <PinnedItem
                                key={msg._id}
                                msg={msg}
                                onUnpin={() => togglePin(msg._id)}
                                unpinning={toggling}
                            />
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}