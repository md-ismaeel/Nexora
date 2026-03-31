import { Listbox, ListboxItem, Avatar, Badge } from "@heroui/react";
import { useNavigate, useParams } from "react-router-dom";
import { HashIcon, VolumeUpIcon, LockIcon, PlusIcon } from "@/utils/lucide";
import { cn } from "@/utils/utils";
import type { IChannel } from "@/types/server.types";

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

  return (
    <ListboxItem
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded mx-2 cursor-pointer transition-colors",
        isSelected
          ? "bg-[#5865f2] text-white"
          : "text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]",
        unreadCount > 0 && !isSelected && "text-[#f2f3f5]",
        className
      )}
      startContent={
        isPrivate ? (
          <LockIcon className="w-4 h-4 text-[#80848e]" />
        ) : (
          <HashIcon className="w-4 h-4 text-[#80848e]" />
        )
      }
      endContent={
        unreadCount > 0 && (
          <Badge size="sm" color="danger" variant="solid">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )
      }
    >
      <span className={cn("truncate", unreadCount > 0 && !isSelected && "font-medium")}>
        {channel.name}
      </span>
    </ListboxItem>
  );
}

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
        <>
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-xs font-bold text-[#949ba4] uppercase tracking-wide">
              Text Channels
            </span>
            {onCreateChannel && (
              <button
                onClick={onCreateChannel}
                className="text-[#949ba4] hover:text-[#dbdee1] transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          <Listbox aria-label="Text channels">
            {textChannels.map((channel) => (
              <ChannelItem
                key={channel._id}
                channel={channel}
                isSelected={selectedChannelId === channel._id}
                onClick={() => onChannelClick(channel._id)}
              />
            ))}
          </Listbox>
        </>
      )}

      {voiceChannels.length > 0 && (
        <>
          <div className="flex items-center justify-between px-2 mt-4 mb-1">
            <span className="text-xs font-bold text-[#949ba4] uppercase tracking-wide">
              Voice Channels
            </span>
            {onCreateChannel && (
              <button
                onClick={onCreateChannel}
                className="text-[#949ba4] hover:text-[#dbdee1] transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          <Listbox aria-label="Voice channels">
            {voiceChannels.map((channel) => (
              <ChannelItem
                key={channel._id}
                channel={channel}
                isSelected={selectedChannelId === channel._id}
                onClick={() => onChannelClick(channel._id)}
              />
            ))}
          </Listbox>
        </>
      )}
    </div>
  );
}

export default ChannelItem;
