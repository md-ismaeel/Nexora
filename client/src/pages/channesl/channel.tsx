import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
// FIX: was SendHorizonal (missing 't') — icon did not exist, send button rendered nothing
import { Hash, Users, Pin, SendHorizontal, AtSign } from "lucide-react";
import { useGetChannelByIdQuery } from "@/api/channel_api";
import { useGetMessagesQuery, useSendMessageMutation } from "@/api/message_api";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setActiveChannel } from "@/store/slices/ui_slice";
import { useTyping } from "@/hooks/use-typing";
import { UserAvatar } from "@/components/custom/user-avatar";
import { formatMessageTime } from "@/lib/utils/utils";
import { isPopulatedUser } from "@/types/message.types";
import type { IMessage } from "@/types/message.types";

// ── Message item
function MessageItem({ msg, isGrouped }: { msg: IMessage; isGrouped: boolean }) {
  const author = msg.author;
  const name = isPopulatedUser(author) ? (author.username ?? author.name) : "Unknown";
  const avatar = isPopulatedUser(author) ? author.avatar : undefined;

  if (isGrouped) {
    return (
      <div className="group flex items-start gap-3 px-4 py-0.5 hover:bg-[#2e3035]">
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
          {msg.reactions.length > 0 && <Reactions reactions={msg.reactions} />}
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-3 px-4 py-1 hover:bg-[#2e3035]">
      <UserAvatar name={name} avatar={avatar} size="md" className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-[#dbdee1]">{name}</span>
          <span className="text-[10px] text-[#4e5058]">{formatMessageTime(msg.createdAt)}</span>
        </div>
        <p className="break-words text-sm leading-relaxed text-[#dbdee1]">
          {msg.content}
          {msg.isEdited && <span className="ml-1 text-[10px] text-[#4e5058]">(edited)</span>}
        </p>
        {msg.reactions.length > 0 && <Reactions reactions={msg.reactions} />}
      </div>
    </div>
  );
}

function Reactions({ reactions }: { reactions: IMessage["reactions"] }) {
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {reactions.map((r) => (
        <span key={r.emoji} className="flex cursor-pointer items-center gap-1 rounded-full bg-[#2b2d31] px-2 py-0.5 text-xs text-[#dbdee1] hover:bg-[#35363c]">
          {r.emoji} <span className="text-[#949ba4]">{r.users.length}</span>
        </span>
      ))}
    </div>
  );
}

// ── Typing indicator 
function TypingIndicator({ userIds }: { userIds: string[] }) {
  if (userIds.length === 0) return null;
  const label = userIds.length === 1 ? "Someone is typing..." : `${userIds.length} people are typing...`;
  return (
    <div className="flex items-center gap-1.5 px-4 pb-1 text-xs text-[#949ba4]">
      <span className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-1 w-1 animate-bounce rounded-full bg-[#949ba4]" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </span>
      {label}
    </div>
  );
}

// ── Channel welcome 
function ChannelWelcome({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-start gap-3 px-4 py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2b2d31]">
        <Hash className="h-8 w-8 text-[#dbdee1]" />
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

// ── Grouping helpers 
function isSameAuthor(a: IMessage, b: IMessage): boolean {
  // After JSON deserialisation _id is always string — safe === compare
  const aId = isPopulatedUser(a.author) ? a.author._id : (a.author as string);
  const bId = isPopulatedUser(b.author) ? b.author._id : (b.author as string);
  return aId === bId;
}

function withinGroupWindow(a: IMessage, b: IMessage): boolean {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() < 5 * 60 * 1000;
}

// ── Main page 
export default function ChannelPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const dispatch = useAppDispatch();
  const [content, setContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const typingUsers = useAppSelector((s) => s.message.typing[channelId ?? ""] ?? []);

  const { data: channelData } = useGetChannelByIdQuery(channelId!, { skip: !channelId });

  // NOTE: pollingInterval is a temporary fallback until Socket.io "message:created"
  // events dispatch addMessage() to the slice. Remove once sockets are wired up.
  const { data: messagesData, isLoading } = useGetMessagesQuery(
    { channelId: channelId! },
    { skip: !channelId, pollingInterval: 3000 },
  );

  const [sendMessage, { isLoading: sending }] = useSendMessageMutation();
  const { startTyping, stopTyping } = useTyping(channelId ?? "");

  const channel = channelData?.data.channel;
  // FIX #10: was data.data.items — backend sends data.data.messages
  const messages = messagesData?.data.messages ?? [];

  useEffect(() => {
    if (channelId) dispatch(setActiveChannel(channelId));
    return () => { dispatch(setActiveChannel(null)); };
  }, [channelId, dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

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

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#3f4147] px-4 shadow-sm">
        <div className="flex min-w-0 items-center gap-2">
          <Hash className="h-5 w-5 shrink-0 text-[#949ba4]" />
          <span className="font-semibold text-white">{channel?.name ?? "..."}</span>
          {channel?.topic && (
            <>
              <div className="mx-2 h-4 w-px shrink-0 bg-[#3f4147]" />
              <span className="truncate text-sm text-[#949ba4]">{channel.topic}</span>
            </>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3 text-[#949ba4]">
          <button className="transition-colors hover:text-white"><Pin className="h-5 w-5" /></button>
          <button className="transition-colors hover:text-white"><Users className="h-5 w-5" /></button>
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#5865f2] border-t-transparent" />
          </div>
        ) : (
          <>
            {channel && <ChannelWelcome name={channel.name} />}
            {messages.map((msg, i) => {
              const prev = messages[i - 1];
              const grouped = !!prev && isSameAuthor(prev, msg) && withinGroupWindow(prev, msg) && !prev.isPinned;
              return <MessageItem key={msg._id} msg={msg} isGrouped={grouped} />;
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Typing indicator */}
      <TypingIndicator userIds={typingUsers} />

      {/* Message input */}
      <div className="shrink-0 px-4 pb-6">
        <div className="flex items-end gap-2 rounded-lg bg-[#383a40] px-4 py-2">
          <button className="mb-1 shrink-0 text-[#949ba4] transition-colors hover:text-white">
            <AtSign className="h-5 w-5" />
          </button>
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
          <button
            onClick={handleSend}
            disabled={!content.trim() || sending}
            className="mb-1 shrink-0 text-[#949ba4] transition-colors hover:text-white disabled:opacity-40"
          >
            {/* FIX: icon name corrected from SendHorizonal → SendHorizontal */}
            <SendHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}