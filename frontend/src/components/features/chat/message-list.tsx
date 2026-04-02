import { forwardRef, useMemo } from "react";
import { UserAvatar } from "@/components/custom/user-avatar";
import { ScrollShadow } from "@heroui/react";
import { cn } from "@/utils/utils";
import type { PopulatedUser } from "@/types/message.types";

export interface ChatMessage {
  _id: string;
  content: string;
  author: PopulatedUser;
  createdAt: string;
  isEdited?: boolean;
  attachments?: { url: string; filename: string; type: string }[];
  reactions?: { emoji: string; count: number; users: string[] }[];
}

export interface MessageListProps {
  messages: ChatMessage[];
  currentUserId?: string;
  onMessageClick?: (message: ChatMessage) => void;
  onReactionClick?: (messageId: string, emoji: string) => void;
  className?: string;
}

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  ({ messages, currentUserId, onMessageClick, onReactionClick, className }, ref) => {
    const groupedMessages = useMemo(() => {
      const groups: { date: string; messages: ChatMessage[] }[] = [];
      let currentGroup: { date: string; messages: ChatMessage[] } | null = null;

      messages.forEach((message) => {
        const messageDate = new Date(message.createdAt).toDateString();
        if (!currentGroup || currentGroup.date !== messageDate) {
          currentGroup = { date: messageDate, messages: [] };
          groups.push(currentGroup);
        }
        currentGroup.messages.push(message);
      });

      return groups;
    }, [messages]);

    const formatTime = (date: string) => {
      return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) return "Today";
      if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
      return date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
    };

    return (
      <ScrollShadow
        ref={ref}
        className={cn("flex-1 overflow-y-auto px-4", className)}
        orientation="vertical"
        hideScrollBar
      >
        {groupedMessages.map((group) => (
          <div key={group.date}>
            <div className="flex items-center gap-4 my-4">
              <div className="h-px flex-1 bg-[#3f4147]" />
              <span className="text-xs text-[#949ba4] font-medium">
                {formatDate(group.date)}
              </span>
              <div className="h-px flex-1 bg-[#3f4147]" />
            </div>

            {group.messages.map((message, idx) => {
              const showAvatar =
                idx === 0 ||
                group.messages[idx - 1].author._id !== message.author._id ||
                new Date(message.createdAt).getTime() -
                  new Date(group.messages[idx - 1].createdAt).getTime() >
                  5 * 60 * 1000;

              return (
                <div
                  key={message._id}
                  className={cn(
                    "group flex gap-4 py-1 px-2 -mx-2 rounded hover:bg-[#2e3035]",
                    showAvatar ? "mt-2" : "mt-0"
                  )}
                  onClick={() => onMessageClick?.(message)}
                >
                  {showAvatar ? (
                    <UserAvatar
                      name={message.author.name}
                      avatar={message.author.avatar}
                      size="md"
                      interactive
                    />
                  ) : (
                    <div className="w-10 shrink-0 flex items-end">
                      <span className="text-[10px] text-[#949ba4] opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {showAvatar && (
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="font-semibold text-[#f2f3f5] hover:underline cursor-pointer">
                          {message.author.name}
                        </span>
                        <span className="text-[10px] text-[#949ba4]">
                          {formatTime(message.createdAt)}
                        </span>
                        {message.isEdited && (
                          <span className="text-[10px] text-[#949ba4]">(edited)</span>
                        )}
                      </div>
                    )}

                    <p className="text-[#dbdee1] whitespace-pre-wrap break-words">
                      {message.content}
                    </p>

                    {message.attachments && message.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.attachments.map((attachment, idx) => (
                          <div
                            key={idx}
                            className="rounded overflow-hidden bg-[#2b2d31]"
                          >
                            {attachment.type.startsWith("image/") ? (
                              <img
                                src={attachment.url}
                                alt={attachment.filename}
                                className="max-w-[300px] max-h-[200px] rounded"
                              />
                            ) : (
                              <div className="flex items-center gap-2 p-2">
                                <span className="text-sm">{attachment.filename}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {message.reactions.map((reaction, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              onReactionClick?.(message._id, reaction.emoji);
                            }}
                            className={cn(
                              "flex items-center gap-1 px-2 py-0.5 rounded-full text-sm border transition-colors",
                              reaction.users.includes(currentUserId || "")
                                ? "bg-[#5865f2] border-[#5865f2] text-white"
                                : "bg-[#2b2d31] border-[#3f4147] text-[#b5bac1] hover:border-[#949ba4]"
                            )}
                          >
                            <span>{reaction.emoji}</span>
                            <span>{reaction.count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </ScrollShadow>
    );
  }
);

MessageList.displayName = "MessageList";

export default MessageList;
