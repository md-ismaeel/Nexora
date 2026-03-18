import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { useAuth } from "@/hooks/use-auth";
import { useGetChannelsQuery } from "@/api/channel.api";
import { useGetFriendsQuery } from "@/api/friend.api";
import { useGetServerByIdQuery } from "@/api/server.api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/custom/user-avatar";
import { Hash, Volume2, Lock, ChevronDown, Plus, Mic, MicOff, Headphones, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IChannel } from "@/types/server.types";
import type { IUser } from "@/types/user.types";
import { useState } from "react";

// Channel item
function ChannelItem({ channel, active, onClick }: { channel: IChannel; active: boolean; onClick: () => void }) {
  const Icon =
    channel.type === "voice" ? Volume2 : channel.isPrivate ? Lock : Hash;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-1.5 rounded px-2 py-[5px] text-sm transition-colors",
        active
          ? "bg-[#404249] text-white"
          : "text-[#949ba4] hover:bg-[#35363c] hover:text-[#dbdee1]",
      )}
    >
      <Icon className="h-4 w-4 shrink-0 opacity-70" />
      <span className="flex-1 truncate text-left">{channel.name}</span>
    </button>
  );
}

// DM friend item
function DmItem({ friend, active, unread }: { friend: IUser; active: boolean; unread: number }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/dm/${friend._id}`)}
      className={cn(
        "group flex w-full items-center gap-2 rounded px-2 py-[5px] transition-colors",
        active
          ? "bg-[#404249] text-white"
          : "text-[#949ba4] hover:bg-[#35363c] hover:text-[#dbdee1]",
      )}
    >
      <UserAvatar
        name={friend.name}
        avatar={friend.avatar}
        status={friend.status}
        size="sm"
      />
      <div className="flex min-w-0 flex-1 flex-col items-start">
        <span className="truncate text-sm font-medium">
          {friend.username ?? friend.name}
        </span>
        <span className="truncate text-xs capitalize opacity-60">
          {friend.status}
        </span>
      </div>
      {unread > 0 && (
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ed4245] px-1 text-[10px] font-bold text-white">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </button>
  );
}

// Server channel panel
function ServerPanel({ serverId }: { serverId: string }) {
  const navigate = useNavigate();
  const { channelId } = useParams();
  const { data: serverData } = useGetServerByIdQuery(serverId);
  const { data: channelData } = useGetChannelsQuery(serverId);

  const server = serverData?.data.server;
  const channels = channelData?.data.channels ?? [];
  const text = channels.filter((c) => c.type === "text");
  const voice = channels.filter((c) => c.type === "voice");

  return (
    <>
      {/* Server name header */}
      <div className="flex h-12 items-center justify-between border-b border-[#1e1f22] px-4 shadow-sm">
        <span className="truncate font-semibold text-white">
          {server?.name ?? "Loading..."}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-[#949ba4]" />
      </div>

      {/* Channel list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-thumb-[#1e1f22]">
        {/* Text channels */}
        {text.length > 0 && (
          <div className="mb-1">
            <div className="flex items-center justify-between px-1 py-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#949ba4]">
                Text Channels
              </span>
              <button className="text-[#949ba4] hover:text-white">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            {text.map((ch) => (
              <ChannelItem
                key={ch._id}
                channel={ch}
                active={channelId === ch._id}
                onClick={() => navigate(`/servers/${serverId}/${ch._id}`)}
              />
            ))}
          </div>
        )}

        {/* Voice channels */}
        {voice.length > 0 && (
          <div className="mb-1">
            <div className="flex items-center justify-between px-1 py-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#949ba4]">
                Voice Channels
              </span>
              <button className="text-[#949ba4] hover:text-white">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            {voice.map((ch) => (
              <ChannelItem
                key={ch._id}
                channel={ch}
                active={channelId === ch._id}
                onClick={() => navigate(`/servers/${serverId}/${ch._id}`)}
              />
            ))}
          </div>
        )}

        {channels.length === 0 && (
          <p className="px-2 py-4 text-center text-xs text-[#4e5058]">
            No channels yet
          </p>
        )}
      </div>
    </>
  );
}

// DM / Friends panel
function DmPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams();
  const unreadCounts = useAppSelector((s) => s.dm.unreadCounts);

  const { data: friendsData } = useGetFriendsQuery();
  const friends = friendsData?.data.friends ?? [];

  return (
    <>
      {/* Header */}
      <div className="flex h-12 items-center border-b border-[#1e1f22] px-4 shadow-sm">
        <span className="font-semibold text-white">Direct Messages</span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-thumb-[#1e1f22]">
        {/* Friends link */}
        <button
          onClick={() => navigate("/friends")}
          className={cn(
            "flex w-full items-center gap-2 rounded px-2 py-[6px] text-sm font-medium transition-colors",
            location.pathname === "/friends"
              ? "bg-[#404249] text-white"
              : "text-[#949ba4] hover:bg-[#35363c] hover:text-[#dbdee1]",
          )}
        >
          <span className="text-base">👥</span>
          Friends
        </button>

        <Separator className="my-2 bg-[#35363c]" />

        {/* DM list */}
        {friends.length > 0 && (
          <>
            <p className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-[#949ba4]">
              Direct Messages
            </p>
            {friends.map((friend) => (
              <DmItem
                key={friend._id}
                friend={friend}
                active={userId === friend._id}
                unread={unreadCounts[friend._id] ?? 0}
              />
            ))}
          </>
        )}
      </div>
    </>
  );
}

// ─── User panel (bottom strip) ───────────────────────────────────────────────

function UserPanel() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [muted, setMuted] = useState(false);

  if (!user) return null;

  return (
    <div className="flex h-[52px] shrink-0 items-center gap-2 bg-[#232428] px-2">
      {/* Avatar + name */}
      <button
        onClick={() => navigate("/settings")}
        className="flex min-w-0 flex-1 items-center gap-2 rounded px-1 py-1 hover:bg-[#35363c]"
      >
        <UserAvatar
          name={user.name}
          avatar={user.avatar}
          status={user.status}
          size="sm"
        />
        <div className="flex min-w-0 flex-col text-left">
          <span className="truncate text-sm font-semibold leading-none text-white">
            {user.username ?? user.name}
          </span>
          <span className="truncate text-[11px] leading-none text-[#949ba4]">
            {user.customStatus || `#${user._id.slice(-4)}`}
          </span>
        </div>
      </button>

      {/* Controls */}
      <TooltipProvider delayDuration={0}>
        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setMuted((m) => !m)}
                className={cn(
                  "rounded p-1.5 transition-colors",
                  muted
                    ? "text-[#ed4245] hover:bg-[#ed4245]/10"
                    : "text-[#b5bac1] hover:bg-[#35363c] hover:text-white",
                )}
              >
                {muted ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {muted ? "Unmute" : "Mute"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="rounded p-1.5 text-[#b5bac1] hover:bg-[#35363c] hover:text-white">
                <Headphones className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Deafen</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate("/settings")}
                className="rounded p-1.5 text-[#b5bac1] hover:bg-[#35363c] hover:text-white"
              >
                <Settings className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">User Settings</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={logout}
                className="rounded p-1.5 text-[#b5bac1] hover:bg-[#ed4245] hover:text-white"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Log Out</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}

// Main export
export default function ChannelSidebar() {
  const { serverId } = useParams();

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-[#2b2d31]">
      {serverId ? <ServerPanel serverId={serverId} /> : <DmPanel />}
      <UserPanel />
    </aside>
  );
}
