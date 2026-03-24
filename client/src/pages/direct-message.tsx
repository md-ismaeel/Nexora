import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// ── Motion
import {
  motion,
  AnimatePresence,
  Messages as MessageMotion,
  makeStagger,
} from "@/lib/motion";
// ── Icons
import { ChatIcons, VoiceIcons } from "@/lib/lucide";

// ── Bubble ────────────────────────────────────────────────────────────────────

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
  recipientAvatar?: string;
  myName: string;
  myAvatar?: string;
}) {
  const name = isOwn ? myName : recipientName;
  const avatar = isOwn ? myAvatar : recipientAvatar;

  return (
    <motion.div
      variants={isOwn ? MessageMotion.outgoing : MessageMotion.incoming}
      className={`group flex items-end gap-2 px-4 py-0.5 ${isOwn ? "flex-row-reverse" : ""}`}
    >
      <div className="w-8 shrink-0">
        {showAvatar ? (
          <UserAvatar name={name} avatar={avatar} size="sm" />
        ) : null}
      </div>

      <div
        className={`flex max-w-[65%] flex-col ${isOwn ? "items-end" : "items-start"}`}
      >
        {showAvatar && (
          <div
            className={`mb-0.5 flex items-baseline gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
          >
            <span className="text-sm font-semibold text-[#dbdee1]">{name}</span>
            <span className="text-[10px] text-[#4e5058]">
              {formatMessageTime(msg.createdAt)}
            </span>
          </div>
        )}

        <motion.div
          whileHover={{ scale: 1.01 }}
          className={`rounded-lg px-3 py-2 text-sm leading-relaxed ${isOwn ? "bg-[#5865f2] text-white" : "bg-[#2b2d31] text-[#dbdee1]"}`}
        >
          {msg.content}
          {msg.isEdited && (
            <span className="ml-1 text-[10px] opacity-60">(edited)</span>
          )}
        </motion.div>

        {!showAvatar && (
          <span className="mt-0.5 text-[10px] text-[#4e5058] opacity-0 transition-opacity group-hover:opacity-100">
            {formatMessageTime(msg.createdAt)}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ── Conversation start ────────────────────────────────────────────────────────

function ConversationStart({
  name,
  avatar,
}: {
  name: string;
  avatar?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-start gap-3 px-4 py-10"
    >
      <UserAvatar name={name} avatar={avatar} size="lg" />
      <div>
        <p className="text-2xl font-bold text-white">{name}</p>
        <p className="mt-1 text-sm text-[#949ba4]">
          This is the beginning of your direct message history with{" "}
          <strong className="text-white">{name}</strong>.
        </p>
      </div>
    </motion.div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getSenderId(msg: IDirectMessage): string {
  return isPopulatedUser(msg.sender) ? msg.sender._id : (msg.sender as string);
}

function withinWindow(a: IDirectMessage, b: IDirectMessage): boolean {
  return (
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() <
    5 * 60 * 1000
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DirectMessagePage() {
  // Route is /channels/@me/:userId
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useAppDispatch();
  const me = useAppSelector((s) => s.auth.user);
  const [content, setContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: userData, isError: userError } = useGetUserByIdQuery(userId!, {
    skip: !userId,
  });
  const { data: historyData, isLoading } = useGetDmHistoryQuery(
    { userId: userId! },
    { skip: !userId, pollingInterval: 3000 },
  );
  const [sendDm, { isLoading: sending }] = useSendDmMutation();
  const [markRead] = useMarkDmReadMutation();

  const recipient = userData?.data.user;
  const messages = historyData?.data.messages ?? [];

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

  if (userError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <p className="text-lg font-semibold text-[#dbdee1]">User not found</p>
        <p className="text-sm text-[#949ba4]">
          This user may have deleted their account.
        </p>
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
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex h-12 shrink-0 items-center justify-between border-b border-[#3f4147] px-4 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <UserAvatar
            name={recipient.name}
            avatar={recipient.avatar}
            status={recipient.status}
            size="sm"
          />
          <span className="font-semibold text-white">
            {recipient.username ?? recipient.name}
          </span>
          <span className="text-xs capitalize text-[#949ba4]">
            • {recipient.status}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[#949ba4]">
          <TooltipProvider delayDuration={0}>
            {[
              { icon: VoiceIcons.JoinCall, label: "Voice Call" },
              { icon: VoiceIcons.VideoOn, label: "Video Call" },
            ].map(({ icon: Icon, label }) => (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="transition-colors hover:text-white"
                  >
                    <Icon className="h-5 w-5" />
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
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
            <ConversationStart
              name={recipient.username ?? recipient.name}
              avatar={recipient.avatar}
            />
            <AnimatePresence>
              {messages.map((msg, i) => {
                const prev = messages[i - 1];
                const senderId = getSenderId(msg);
                const isOwn = senderId === me?._id;
                const grouped =
                  !!prev &&
                  getSenderId(prev) === senderId &&
                  withinWindow(prev, msg);
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
            </AnimatePresence>
            <div ref={bottomRef} />
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end gap-2 rounded-lg bg-[#383a40] px-4 py-2"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{
                  scale: 1.15,
                  rotate: 8,
                  transition: { type: "spring", stiffness: 420, damping: 30 },
                }}
                whileTap={{ scale: 0.88 }}
                className="mb-1 shrink-0 text-[#949ba4] transition-colors hover:text-white"
              >
                <ChatIcons.Attach className="h-5 w-5" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>Add Attachment</TooltipContent>
          </Tooltip>

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

          <motion.button
            onClick={handleSend}
            disabled={!content.trim() || sending}
            whileHover={{
              scale: 1.15,
              transition: { type: "spring", stiffness: 420, damping: 30 },
            }}
            whileTap={{ scale: 0.88 }}
            className="mb-1 shrink-0 text-[#949ba4] transition-colors hover:text-[#5865f2] disabled:opacity-40"
          >
            <ChatIcons.Send className="h-5 w-5" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
