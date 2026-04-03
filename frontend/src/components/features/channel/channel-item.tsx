import { cn } from "@/utils/utils"
import type { IChannel } from "@/types/server.types"
import { HashIcon, LockIcon, PlusIcon } from "@/utils/lucide"

export interface ChannelItemProps {
  channel: IChannel
  isSelected?: boolean
  unreadCount?: number
  onClick: () => void
  onContextMenu?: (e: React.MouseEvent) => void
  className?: string
}

export function ChannelItem({
  channel,
  isSelected,
  unreadCount = 0,
  onClick,
  onContextMenu,
  className,
}: ChannelItemProps) {
  const isPrivate = channel.isPrivate

  return (
    <button
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={cn(
        "mx-2 flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer transition-colors outline-none",
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
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ed4245] px-1 text-[10px] font-bold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  )
}

export interface ChannelListProps {
  channels: IChannel[]
  selectedChannelId?: string
  onChannelClick: (channelId: string) => void
  onCreateChannel?: () => void
  className?: string
}

export function ChannelList({
  channels,
  selectedChannelId,
  onChannelClick,
  onCreateChannel,
  className,
}: ChannelListProps) {
  const textChannels = channels.filter((c) => c.type === "text")
  const voiceChannels = channels.filter((c) => c.type === "voice")

  return (
    <div className={cn("py-2", className)}>
      {textChannels.length > 0 && (
        <section>
          <div className="mb-1 flex items-center justify-between px-2">
            <span className="text-xs font-bold uppercase text-[#949ba4] tracking-wide">
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

          <div className="p-0">
            {textChannels.map((channel) => (
              <ChannelItem
                key={channel._id}
                channel={channel}
                isSelected={selectedChannelId === channel._id}
                onClick={() => onChannelClick(channel._id)}
              />
            ))}
          </div>
        </section>
      )}

      {voiceChannels.length > 0 && (
        <section className="mt-4">
          <div className="mb-1 flex items-center justify-between px-2">
            <span className="text-xs font-bold uppercase text-[#949ba4] tracking-wide">
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

          <div className="p-0">
            {voiceChannels.map((channel) => (
              <ChannelItem
                key={channel._id}
                channel={channel}
                isSelected={selectedChannelId === channel._id}
                onClick={() => onChannelClick(channel._id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default ChannelItem
