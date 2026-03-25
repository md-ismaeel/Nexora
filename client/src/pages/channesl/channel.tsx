import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useGetChannelByIdQuery } from "@/api/channel_api";
import { useSendMessageMutation } from "@/api/message_api";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setActiveChannel } from "@/store/slices/ui_slice";
import { useMessages } from "@/hooks/use-message";
import { useTyping } from "@/hooks/use-typing";
import { useContextMenu } from "@/components/custom/context-menu";
import { PinnedMessages } from "@/components/chat/pinned-messages";
import { UserAvatar } from "@/components/custom/user-avatar";
import { formatMessageTime } from "@/lib/utils/utils";
import { isPopulatedUser } from "@/types/message.types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { IMessage } from "@/types/message.types";
import {
  motion, AnimatePresence,
  Messages as MessageMotion,
  Reactions,
  vp, makeStagger,
} from "@/lib/motion";
import { SidebarIcons, ChatIcons, UIIcons } from "@/lib/lucide";

// ── Message action bar ────────────────────────────────────────────────────────

function MessageActions({ msg, onPin }: { msg: IMessage; onPin: () => void }) {
  return (
    <div className="invisible absolute -top-4 right-4 flex items-center gap-0.5 rounded-md border border-[#3f4147] bg-[#2b2d31] px-1 py-0.5 shadow-lg group-hover:visible">
      <TooltipProvider delayDuration={0}>
        {[
          { icon: ChatIcons.React, label: "Add Reaction", onClick: () => { } },
          { icon: ChatIcons.Reply, label: "Reply", onClick: () => { } },
          { icon: ChatIcons.Edit, label: "Edit", onClick: () => { } },
          { icon: ChatIcons.Pin, label: msg.isPinned ? "Unpin" : "Pin", onClick: onPin },
          { icon: ChatIcons.MoreActions, label: "More", onClick: () => { } },
        ].map(({ icon: Icon, label, onClick }) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <motion.button
                onClick={onClick}
                whileHover={{ scale: 1.18, transition: { type: "spring", stiffness: 420, damping: 30 } }}
                whileTap={{ scale: 0.88 }}
                className="rounded p-1 text-[#949ba4] hover:text-white transition-colors"
              >
                <Icon className="h-4 w-4" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}

// ── Reaction pills ────────────────────────────────────────────────────────────

function ReactionList({ reactions }: { reactions: IMessage["reactions"] }) {
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      <AnimatePresence>
        {reactions.map((r) => (
          <motion.span
            key={r.emoji}
            {...vp(Reactions.pill)}
            whileHover={{ scale: 1.22, y: -3, transition: { type: "spring", stiffness: 520, damping: 18 } }}
            whileTap={{ scale: 0.9 }}
            className="flex cursor-pointer items-center gap-1 rounded-full bg-[#2b2d31] px-2 py-0.5 text-xs text-[#dbdee1] hover:bg-[#35363c]"
          >
            {r.emoji}
            <span className="text-[#949ba4]">{r.users.length}</span>
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Message item ──────────────────────────────────────────────────────────────

function MessageItem({
  msg,
  isGrouped,
  onPin,
}: {
  msg: IMessage;
  isGrouped: boolean;
  onPin: () => void;
}) {
  const { show } = useContextMenu();
  const author = msg.author;
  const name = isPopulatedUser(author) ? (author.username ?? author.name) : "Unknown";
  const avatar = isPopulatedUser(author) ? author.avatar : undefined;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    show(e.clientX, e.clientY, [
      { id: "reply", label: "Reply", icon: ChatIcons.Reply, onClick: () => { } },
      { id: "edit", label: "Edit Message", icon: ChatIcons.Edit, onClick: () => { } },
      { id: "pin", label: msg.isPinned ? "Unpin Message" : "Pin Message", icon: ChatIcons.Pin, onClick: onPin },
      { id: "copy", label: "Copy Text", icon: ChatIcons.CopyText, onClick: () => navigator.clipboard.writeText(msg.content) },
      { id: "delete", label: "Delete Message", icon: ChatIcons.Delete, danger: true, separator: true, onClick: () => { } },
    ]);
  };

  if (isGrouped) {
    return (
      <motion.div
        variants={MessageMotion.item}
        onContextMenu={handleContextMenu}
        className="group relative flex items-start gap-3 px-4 py-0.5 hover:bg-[#2e3035]"
      >
        <div className="w-10 shrink-0 text-right">
          <span className="hidden text-[10px] text-[#4e5058] group-hover:inline">
            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm leading-relaxed text-[#dbdee1]">
            {msg.content}
            {msg.isEdited && <span className="ml-1 text-[10px] text-[#4e5058]">(edited)</span>}
          </p>
          {msg.reactions.length > 0 && <ReactionList reactions={msg.reactions} />}
        </div>
        <MessageActions msg={msg} onPin={onPin} />
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={MessageMotion.item}
      onContextMenu={handleContextMenu}
      className="group relative flex items-start gap-3 px-4 py-1 hover:bg-[#2e3035]"
    >
      <UserAvatar name={name} avatar={avatar} size="md" className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-[#dbdee1]">{name}</span>
          <span className="text-[10px] text-[#4e5058]">{formatMessageTime(msg.createdAt)}</span>
          {msg.isPinned && (
            <span className="flex items-center gap-0.5 text-[10px] text-[#949ba4]">
              <ChatIcons.Pin className="h-2.5 w-2.5" /> pinned
            </span>
          )}
        </div>
        <p className="break-words text-sm leading-relaxed text-[#dbdee1]">
          {msg.content}
          {msg.isEdited && <span className="ml-1 text-[10px] text-[#4e5058]">(edited)</span>}
        </p>
        {msg.reactions.length > 0 && <ReactionList reactions={msg.reactions} />}
      </div>
      <MessageActions msg={msg} onPin={onPin} />
    </motion.div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingIndicator({ userIds }: { userIds: string[] }) {
  if (userIds.length === 0) return null;
  const label =
    userIds.length === 1
      ? "Someone is typing..."
      : `${userIds.length} people are typing...`;
  return (
    <motion.div
      {...vp(MessageMotion.typingWrapper)}
      className="flex items-center gap-1.5 px-4 pb-1 text-xs text-[#949ba4]"
    >
      <span className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            variants={MessageMotion.typingDot}
            custom={i}
            animate="animate"
            className="h-1 w-1 rounded-full bg-[#949ba4]"
          />
        ))}
      </span>
      {label}
    </motion.div>
  );
}

// ── Channel welcome ───────────────────────────────────────────────────────────

function ChannelWelcome({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-start gap-3 px-4 py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2b2d31]">
        <SidebarIcons.TextChannel className="h-8 w-8 text-[#dbdee1]" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">Welcome to #{name}!</p>
        <p className="mt-1 text-sm text-[#949ba4]">
          This is the start of the <strong className="text-white">#{name}</strong> channel.
        </p>
      </div>
    </div>
  );
}

// ── Load more sentinel ────────────────────────────────────────────────────────

function LoadMoreSentinel({ onVisible }: { onVisible: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onVisible(); },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onVisible]);
  return <div ref={ref} className="h-1" />;
}

// ── Grouping helpers ──────────────────────────────────────────────────────────

function isSameAuthor(a: IMessage, b: IMessage): boolean {
  const aId = isPopulatedUser(a.author) ? a.author._id : (a.author as string);
  const bId = isPopulatedUser(b.author) ? b.author._id : (b.author as string);
  return aId === bId;
}

function withinGroupWindow(a: IMessage, b: IMessage): boolean {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() < 5 * 60 * 1000;
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ChannelPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const dispatch = useAppDispatch();
  const [content, setContent] = useState("");
  const [showPinned, setShowPinned] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const typingUsers = useAppSelector(
    (s) => s.message.typing[channelId ?? ""] ?? [],
  );

  const { data: channelData } = useGetChannelByIdQuery(channelId!, {
    skip: !channelId,
  });

  // useMessages provides real-time slice messages + loadMore for infinite scroll
  const { messages, isLoading, isFetching, hasMore, loadMore } = useMessages({
    channelId,
  });

  const [sendMessage, { isLoading: sending }] = useSendMessageMutation();
  const { startTyping, stopTyping } = useTyping(channelId ?? "");

  const channel = channelData?.data.channel;

  useEffect(() => {
    if (channelId) dispatch(setActiveChannel(channelId));
    return () => { dispatch(setActiveChannel(null)); };
  }, [channelId, dispatch]);

  // Scroll to bottom on new messages (only when already near bottom)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
    if (nearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // Scroll to bottom on first load
  useEffect(() => {
    if (!isLoading) {
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [isLoading]);

  const handleSend = async () => {
    if (!content.trim() || !channelId || sending) return;
    const text = content.trim();
    setContent("");
    stopTyping();
    try {
      await sendMessage({ channelId, content: text }).unwrap();
    } catch {
      setContent(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      return;
    }
    startTyping();
  };

  const handleLoadMore = useCallback(() => {
    if (!isFetching && hasMore) loadMore();
  }, [isFetching, hasMore, loadMore]);

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex h-12 shrink-0 items-center justify-between border-b border-[#3f4147] px-4 shadow-sm"
        >
          <div className="flex min-w-0 items-center gap-2">
            <SidebarIcons.TextChannel className="h-5 w-5 shrink-0 text-[#949ba4]" />
            <span className="font-semibold text-white">{channel?.name ?? "..."}</span>
            {channel?.topic && (
              <>
                <div className="mx-2 h-4 w-px shrink-0 bg-[#3f4147]" />
                <span className="truncate text-sm text-[#949ba4]">{channel.topic}</span>
              </>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1 text-[#949ba4]">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    onClick={() => setShowPinned((v) => !v)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`rounded p-1.5 transition-colors ${showPinned ? "bg-[#404249] text-white" : "hover:text-white"}`}
                  >
                    <ChatIcons.Pin className="h-5 w-5" />
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent>Pinned Messages</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="rounded p-1.5 transition-colors hover:text-white"
                  >
                    <UIIcons.Menu className="h-5 w-5" />
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent>Member List</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </motion.div>

        {/* Message list */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#1e1f22]">
          {/* Load more sentinel at top */}
          {hasMore && <LoadMoreSentinel onVisible={handleLoadMore} />}

          {isFetching && hasMore && (
            <div className="flex justify-center py-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#5865f2] border-t-transparent" />
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#5865f2] border-t-transparent" />
            </div>
          ) : (
            <motion.div
              variants={makeStagger({ staggerChildren: 0.02 })}
              initial="hidden"
              animate="visible"
            >
              {channel && <ChannelWelcome name={channel.name} />}
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => {
                  const prev = messages[i - 1];
                  const grouped =
                    !!prev &&
                    isSameAuthor(prev, msg) &&
                    withinGroupWindow(prev, msg) &&
                    !prev.isPinned;
                  return (
                    <MessageItem
                      key={msg._id}
                      msg={msg}
                      isGrouped={grouped}
                      onPin={() => {/* togglePin handled via context menu */ }}
                    />
                  );
                })}
              </AnimatePresence>
              <div ref={bottomRef} />
            </motion.div>
          )}
        </div>

        {/* Typing indicator */}
        <AnimatePresence>
          <TypingIndicator userIds={typingUsers} />
        </AnimatePresence>

        {/* Message input */}
        <div className="shrink-0 px-4 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end gap-2 rounded-lg bg-[#383a40] px-4 py-2"
          >
            <TooltipProvider delayDuration={0}>
              {[
                { icon: ChatIcons.Attach, label: "Add Attachment" },
                { icon: ChatIcons.Mention, label: "Mention" },
              ].map(({ icon: Icon, label }) => (
                <Tooltip key={label}>
                  <TooltipTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.15, rotate: 8, transition: { type: "spring", stiffness: 420, damping: 30 } }}
                      whileTap={{ scale: 0.88 }}
                      className="mb-1 shrink-0 text-[#949ba4] transition-colors hover:text-white"
                    >
                      <Icon className="h-5 w-5" />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent>{label}</TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>

            <textarea
              ref={inputRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message #${channel?.name ?? "channel"}`}
              rows={1}
              className="flex-1 resize-none bg-transparent py-1 text-sm text-[#dbdee1] placeholder:text-[#4e5058] outline-none"
              style={{ maxHeight: "200px" }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = `${el.scrollHeight}px`;
              }}
            />

            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  onClick={handleSend}
                  disabled={!content.trim() || sending}
                  whileHover={{ scale: 1.15, transition: { type: "spring", stiffness: 420, damping: 30 } }}
                  whileTap={{ scale: 0.88 }}
                  className="mb-1 shrink-0 text-[#949ba4] transition-colors hover:text-[#5865f2] disabled:opacity-40"
                >
                  <ChatIcons.Send className="h-5 w-5" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent>Send Message</TooltipContent>
            </Tooltip>
          </motion.div>
        </div>
      </div>

      {/* Pinned messages side panel */}
      <AnimatePresence>
        {showPinned && (
          <PinnedMessages onClose={() => setShowPinned(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}