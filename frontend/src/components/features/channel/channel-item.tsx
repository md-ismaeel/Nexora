import { ListBox, Badge } from "@heroui/react";
import { cn } from "@/utils/utils";
import type { IChannel } from "@/types/server.types";

// ── Icon helpers (from your lucide barrel) ────────────────────────────────────
import { HashIcon, LockIcon, PlusIcon } from "@/utils/lucide";

// ── Single channel row ────────────────────────────────────────────────────────

export interface ChannelItemProps {
  channel: IChannel;
  isSelected?: boolean;
  unreadCount?: number;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  className?: string;
}

export function ChannelItem({
  channel,
  isSelected,
  unreadCount = 0,
  onClick,
  onContextMenu,
  className,
}: ChannelItemProps) {
  const isPrivate = channel.isPrivate;

  // v3 ListBox.Item — renders as an accessible list item.
  // Use textValue for screen-reader label; children are the visual content.
  return (
    <ListBox.Item
      textValue={channel.name}
      onAction={onClick}
      onContextMenu={onContextMenu}
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded mx-2 cursor-pointer transition-colors outline-none",
        isSelected
          ? "bg-[#5865f2] text-white"
          : "text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]",
        unreadCount > 0 && !isSelected && "text-[#f2f3f5]",
        className,
      )}
    >
      <span className="shrink-0">
        {isPrivate
          ? <LockIcon className="h-4 w-4 text-[#80848e]" />
          : <HashIcon className="h-4 w-4 text-[#80848e]" />}
      </span>

      <span className={cn("flex-1 truncate text-sm", unreadCount > 0 && !isSelected && "font-medium")}>
        {channel.name}
      </span>

      {unreadCount > 0 && (
        // v3 Badge — simple component.
        // color: "default" | "accent" | "success" | "warning" | "danger"
        <Badge color="danger" size="sm">
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </ListBox.Item>
  );
}

// ── Channel list ──────────────────────────────────────────────────────────────

export interface ChannelListProps {
  channels: IChannel[];
  selectedChannelId?: string;
  onChannelClick: (channelId: string) => void;
  onCreateChannel?: () => void;
  className?: string;
}

export function ChannelList({
  channels,
  selectedChannelId,
  onChannelClick,
  onCreateChannel,
  className,
}: ChannelListProps) {
  const textChannels = channels.filter((c) => c.type === "text");
  const voiceChannels = channels.filter((c) => c.type === "voice");

  return (
    <div className={cn("py-2", className)}>
      {textChannels.length > 0 && (
        <section>
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-xs font-bold text-[#949ba4] uppercase tracking-wide">
              Text Channels
            </span>
            {onCreateChannel && (
              <button
                onClick={onCreateChannel}
                className="text-[#949ba4] hover:text-[#dbdee1] transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* v3 ListBox — wraps ListBox.Item children */}
          <ListBox aria-label="Text channels" className="p-0">
            {textChannels.map((channel) => (
              <ChannelItem
                key={channel._id}
                channel={channel}
                isSelected={selectedChannelId === channel._id}
                onClick={() => onChannelClick(channel._id)}
              />
            ))}
          </ListBox>
        </section>
      )}

      {voiceChannels.length > 0 && (
        <section className="mt-4">
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-xs font-bold text-[#949ba4] uppercase tracking-wide">
              Voice Channels
            </span>
            {onCreateChannel && (
              <button
                onClick={onCreateChannel}
                className="text-[#949ba4] hover:text-[#dbdee1] transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          <ListBox aria-label="Voice channels" className="p-0">
            {voiceChannels.map((channel) => (
              <ChannelItem
                key={channel._id}
                channel={channel}
                isSelected={selectedChannelId === channel._id}
                onClick={() => onChannelClick(channel._id)}
              />
            ))}
          </ListBox>
        </section>
      )}
    </div>
  );
}

export default ChannelItem;