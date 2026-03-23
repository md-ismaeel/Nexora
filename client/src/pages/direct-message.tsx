import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
// FIX: was SendHorizonal (missing 't') — icon did not exist, send button rendered nothing
import { SendHorizontal, Phone, Video } from "lucide-react";
import { useGetUserByIdQuery } from "@/api/user_api";
import {
  useGetDmHistoryQuery,
  useSendDmMutation,
  useMarkDmReadMutation,
} from "@/api/dm_api";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearUnread } from "@/store/slices/dm_slice";
import { UserAvatar } from "@/components/custom/user-avatar";
import { formatMessageTime } from "@/lib/utils/utils";
import { isPopulatedUser } from "@/types/message.types";
import type { IDirectMessage } from "@/types/message.types";

// ── Message bubble ────────────────────────────────────────────────────────────

function Bubble({
  msg,
  isOwn,
  showAvatar,
  recipientName,
  recipientAvatar,
  myName,
  myAvatar,
}: {
  msg: IDirectMessage;
  isOwn: boolean;
  showAvatar: boolean;
  recipientName: string;
  recipientAvatar: string | undefined;
  myName: string;
  myAvatar: string | undefined;
}) {
  const name = isOwn ? myName : recipientName;
  const avatar = isOwn ? myAvatar : recipientAvatar;

  return (
    <div className={`group flex items-end gap-2 px-4 py-0.5 ${isOwn ? "flex-row-reverse" : ""}`}>
      <div className="w-8 shrink-0">
        {showAvatar ? <UserAvatar name={name} avatar={avatar} size="sm" /> : null}
      </div>

      <div className={`flex max-w-[65%] flex-col ${isOwn ? "items-end" : "items-start"}`}>
        {showAvatar && (
          <div className={`mb-0.5 flex items-baseline gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
            <span className="text-sm font-semibold text-[#dbdee1]">{name}</span>
            <span className="text-[10px] text-[#4e5058]">{formatMessageTime(msg.createdAt)}</span>
          </div>
        )}

        <div className={`rounded-lg px-3 py-2 text-sm leading-relaxed ${isOwn ? "bg-[#5865f2] text-white" : "bg-[#2b2d31] text-[#dbdee1]"}`}>
          {msg.content}
          {msg.isEdited && <span className="ml-1 text-[10px] opacity-60">(edited)</span>}
        </div>

        {!showAvatar && (
          <span className="mt-0.5 text-[10px] text-[#4e5058] opacity-0 transition-opacity group-hover:opacity-100">
            {formatMessageTime(msg.createdAt)}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Conversation start ────────────────────────────────────────────────────────

function ConversationStart({ name, avatar }: { name: string; avatar: string | undefined }) {
  return (
    <div className="flex flex-col items-start gap-3 px-4 py-10">
      <UserAvatar name={name} avatar={avatar} size="lg" />
      <div>
        <p className="text-2xl font-bold text-white">{name}</p>
        <p className="mt-1 text-sm text-[#949ba4]">
          This is the beginning of your direct message history with{" "}
          <strong className="text-white">{name}</strong>.
        </p>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getSenderId(msg: IDirectMessage): string {
  return isPopulatedUser(msg.sender) ? msg.sender._id : (msg.sender as string);
}

function withinWindow(a: IDirectMessage, b: IDirectMessage): boolean {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() < 5 * 60 * 1000;
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DirectMessage() {
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useAppDispatch();
  const me = useAppSelector((s) => s.auth.user);
  const [content, setContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // FIX: added isError to show an error state instead of an infinite spinner
  const { data: userData, isError: userError } = useGetUserByIdQuery(userId!, { skip: !userId });

  // NOTE: same pollingInterval note as channel.tsx — replace with socket event
  const { data: historyData, isLoading } = useGetDmHistoryQuery(
    { userId: userId! },
    { skip: !userId, pollingInterval: 3000 },
  );

  const [sendDm, { isLoading: sending }] = useSendDmMutation();
  const [markRead] = useMarkDmReadMutation();

  const recipient = userData?.data.user;
  // FIX: was data.data.items — dm_api getDmHistory returns data.data.messages
  const messages = historyData?.data.messages ?? [];

  // FIX: removed markRead and dispatch from deps — markRead reference changes
  // every render causing this effect to fire repeatedly. Only userId matters.
  useEffect(() => {
    if (userId) {
      markRead(userId);
      dispatch(clearUnread(userId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    if (!content.trim() || !userId || sending) return;
    const text = content.trim();
    setContent("");
    try {
      await sendDm({ receiverId: userId, content: text }).unwrap();
    } catch {
      setContent(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // FIX: show error state instead of infinite spinner when user fetch fails
  if (userError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <p className="text-lg font-semibold text-[#dbdee1]">User not found</p>
        <p className="text-sm text-[#949ba4]">This user may have deleted their account.</p>
      </div>
    );
  }

  if (!recipient) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5865f2] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#3f4147] px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <UserAvatar name={recipient.name} avatar={recipient.avatar} status={recipient.status} size="sm" />
          <span className="font-semibold text-white">{recipient.username ?? recipient.name}</span>
          <span className="text-xs capitalize text-[#949ba4]">• {recipient.status}</span>
        </div>
        <div className="flex items-center gap-3 text-[#949ba4]">
          <button className="transition-colors hover:text-white"><Phone className="h-5 w-5" /></button>
          <button className="transition-colors hover:text-white"><Video className="h-5 w-5" /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#5865f2] border-t-transparent" />
          </div>
        ) : (
          <>
            <ConversationStart name={recipient.username ?? recipient.name} avatar={recipient.avatar} />
            {messages.map((msg, i) => {
              const prev = messages[i - 1];
              const senderId = getSenderId(msg);
              const isOwn = senderId === me?._id;
              const grouped = !!prev && getSenderId(prev) === senderId && withinWindow(prev, msg);
              return (
                <Bubble
                  key={msg._id}
                  msg={msg}
                  isOwn={isOwn}
                  showAvatar={!grouped}
                  recipientName={recipient.username ?? recipient.name}
                  recipientAvatar={recipient.avatar}
                  myName={me?.username ?? me?.name ?? "Me"}
                  myAvatar={me?.avatar}
                />
              );
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 pb-6">
        <div className="flex items-end gap-2 rounded-lg bg-[#383a40] px-4 py-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message @${recipient.username ?? recipient.name}`}
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