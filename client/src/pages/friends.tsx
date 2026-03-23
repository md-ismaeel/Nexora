import { useState } from "react";
import {
  Users,
  UserPlus,
  Check,
  X,
  Clock,
  UserMinus,
  MessageCircle,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useGetFriendsQuery,
  useGetAllFriendRequestsQuery,
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useDeclineFriendRequestMutation,
  useCancelFriendRequestMutation,
  useRemoveFriendMutation,
} from "@/api/friend_api";
// FIX: need to search by username first to get userId before sending request
import { useSearchUsersQuery } from "@/api/user_api";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { UserAvatar } from "@/components/custom/user-avatar";
import { EmptyState } from "@/components/custom/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isPopulatedUser } from "@/types/message.types";
import type { IFriendRequest } from "@/types/message.types";
import type { IUser } from "@/types/user.types";

// ── Add friend bar ────────────────────────────────────────────────────────────

/**
 * FIX: sendFriendRequest takes a userId (MongoDB ObjectId), not a username.
 *
 * Previous code: await send(value.trim())  ← sent the raw username string,
 * which the backend treated as an ObjectId → always failed with 400/500.
 *
 * Fixed flow:
 *   1. User types a username into the input
 *   2. useSearchUsersQuery runs live as they type (skip when empty)
 *   3. On submit we look up the matching user from results and send by _id
 */
function AddFriendBar() {
  const [query, setQuery] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [successName, setSuccessName] = useState<string | null>(null);

  const [send, { isLoading: sending }] = useSendFriendRequestMutation();

  // Search live — debounce is handled naturally by RTK Query dedup
  const { data: searchData, isFetching: searching } = useSearchUsersQuery(
    { q: query.trim() },
    { skip: query.trim().length < 2 },
  );
  const results = searchData?.data.users ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessName(null);

    const trimmed = query.trim();
    if (!trimmed) return;

    // Find exact username match (case-insensitive)
    const match = results.find(
      (u) =>
        u.username?.toLowerCase() === trimmed.toLowerCase() ||
        u.name.toLowerCase() === trimmed.toLowerCase(),
    );

    if (!match) {
      setLocalError(
        "No user found with that username. Check the spelling and try again.",
      );
      return;
    }

    try {
      await send(match._id).unwrap();
      setSuccessName(match.username ?? match.name);
      setQuery("");
    } catch (err) {
      const msg = (err as FetchBaseQueryError & { data?: { message?: string } })
        ?.data?.message;
      setLocalError(msg ?? "Failed to send friend request.");
    }
  };

  return (
    <div className="border-b border-[#3f4147] px-8 py-5">
      <h2 className="mb-1 text-xs font-bold uppercase tracking-wide text-[#dbdee1]">
        Add Friend
      </h2>
      <p className="mb-3 text-sm text-[#949ba4]">
        You can add friends with their username.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4e5058]" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLocalError(null);
              setSuccessName(null);
            }}
            placeholder="Enter a username"
            className="border-none bg-[#1e1f22] pl-9 text-white placeholder:text-[#4e5058] focus-visible:ring-[#5865f2]"
          />
        </div>
        <Button
          type="submit"
          disabled={sending || searching || !query.trim()}
          className="bg-[#5865f2] text-white hover:bg-[#4752c4] disabled:opacity-60"
        >
          {sending ? "Sending..." : "Send Request"}
        </Button>
      </form>

      {/* Live search suggestions */}
      {query.trim().length >= 2 && results.length > 0 && !successName && (
        <div className="mt-2 rounded-lg border border-[#3f4147] bg-[#2b2d31] py-1">
          {results.slice(0, 5).map((u) => (
            <button
              key={u._id}
              type="button"
              onClick={() => setQuery(u.username ?? u.name)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[#dbdee1] hover:bg-[#35363c]"
            >
              <UserAvatar
                name={u.name}
                avatar={u.avatar}
                status={u.status}
                size="xs"
              />
              <span>{u.username ?? u.name}</span>
            </button>
          ))}
        </div>
      )}

      {successName && (
        <p className="mt-2 text-sm text-green-400">
          ✓ Friend request sent to <strong>{successName}</strong>!
        </p>
      )}
      {localError && (
        <p className="mt-2 text-sm text-[#ed4245]">{localError}</p>
      )}
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <p className="mb-1 px-4 text-xs font-bold uppercase tracking-wide text-[#949ba4]">
      {label} — {count}
    </p>
  );
}

// ── Friend row ────────────────────────────────────────────────────────────────

function FriendRow({ friend }: { friend: IUser }) {
  const navigate = useNavigate();
  const [remove, { isLoading }] = useRemoveFriendMutation();

  return (
    <div
      className="group flex cursor-pointer items-center gap-3 rounded-lg px-4 py-2 hover:bg-[#35363c]"
      onClick={() => navigate(`/dm/${friend._id}`)}
    >
      <UserAvatar
        name={friend.name}
        avatar={friend.avatar}
        status={friend.status}
        size="md"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-[#dbdee1]">
          {friend.username ?? friend.name}
        </p>
        <p className="truncate text-xs capitalize text-[#949ba4]">
          {friend.status}
        </p>
      </div>

      <TooltipProvider delayDuration={0}>
        <div className="hidden items-center gap-1 group-hover:flex">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/dm/${friend._id}`);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2b2d31] text-[#949ba4] hover:text-white"
              >
                <MessageCircle className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Message</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  remove(friend._id);
                }}
                disabled={isLoading}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2b2d31] text-[#949ba4] hover:text-[#ed4245]"
              >
                <UserMinus className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Remove Friend</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}

// ── Incoming request ──────────────────────────────────────────────────────────

function IncomingRow({ request }: { request: IFriendRequest }) {
  const [accept, { isLoading: accepting }] = useAcceptFriendRequestMutation();
  const [decline, { isLoading: declining }] = useDeclineFriendRequestMutation();

  const sender = isPopulatedUser(request.sender)
    ? request.sender
    : {
      _id: request.sender as string,
      name: "Unknown",
      avatar: undefined,
      username: undefined,
    };

  return (
    <div className="flex items-center gap-3 rounded-lg px-4 py-2 hover:bg-[#35363c]">
      <UserAvatar name={sender.name} avatar={sender.avatar} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-[#dbdee1]">
          {sender.username ?? sender.name}
        </p>
        <p className="text-xs text-[#949ba4]">Incoming Friend Request</p>
      </div>
      <TooltipProvider delayDuration={0}>
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => accept(request._id)}
                disabled={accepting}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2b2d31] text-[#949ba4] hover:text-green-400"
              >
                <Check className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Accept</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => decline(request._id)}
                disabled={declining}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2b2d31] text-[#949ba4] hover:text-[#ed4245]"
              >
                <X className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Decline</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}

// ── Outgoing request ──────────────────────────────────────────────────────────

function OutgoingRow({ request }: { request: IFriendRequest }) {
  const [cancel, { isLoading }] = useCancelFriendRequestMutation();

  const receiver = isPopulatedUser(request.receiver)
    ? request.receiver
    : {
      _id: request.receiver as string,
      name: "Unknown",
      avatar: undefined,
      username: undefined,
    };

  return (
    <div className="flex items-center gap-3 rounded-lg px-4 py-2 hover:bg-[#35363c]">
      <UserAvatar name={receiver.name} avatar={receiver.avatar} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-[#dbdee1]">
          {receiver.username ?? receiver.name}
        </p>
        <p className="text-xs text-[#949ba4]">Outgoing Friend Request</p>
      </div>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => cancel(request._id)}
              disabled={isLoading}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2b2d31] text-[#949ba4] hover:text-[#ed4245]"
            >
              <X className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Cancel Request</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex justify-center py-10">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#5865f2] border-t-transparent" />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function FriendsPage() {
  const { data: fd, isLoading } = useGetFriendsQuery();
  const { data: rd } = useGetAllFriendRequestsQuery();

  const friends = fd?.data.friends ?? [];
  const online = friends.filter((f) => f.status === "online");
  const received = rd?.data.received ?? [];
  const sent = rd?.data.sent ?? [];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex h-12 items-center gap-3 border-b border-[#3f4147] px-4 shadow-sm">
        <Users className="h-5 w-5 text-[#949ba4]" />
        <span className="font-semibold text-white">Friends</span>
      </div>

      <Tabs
        defaultValue="online"
        className="flex flex-1 flex-col overflow-hidden"
      >
        {/* Tab bar */}
        <div className="border-b border-[#3f4147] px-4">
          <TabsList className="h-12 gap-1 bg-transparent p-0">
            {[
              { value: "online", label: "Online", badge: online.length },
              { value: "all", label: "All", badge: friends.length },
              { value: "pending", label: "Pending", badge: received.length },
            ].map(({ value, label, badge }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="rounded px-3 py-1 text-sm text-[#949ba4] data-[state=active]:bg-[#35363c] data-[state=active]:text-white"
              >
                {label}
                {badge > 0 && (
                  <span className="ml-1.5 rounded-full bg-[#ed4245] px-1.5 text-xs text-white">
                    {badge}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Online */}
        <TabsContent value="online" className="mt-0 flex-1 overflow-y-auto">
          <AddFriendBar />
          <div className="p-4">
            <SectionHeader label="Online" count={online.length} />
            {isLoading ? (
              <Spinner />
            ) : online.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No friends online"
                description="Your online friends will appear here."
                className="py-12"
              />
            ) : (
              online.map((f) => <FriendRow key={f._id} friend={f} />)
            )}
          </div>
        </TabsContent>

        {/* All */}
        <TabsContent value="all" className="mt-0 flex-1 overflow-y-auto p-4">
          <SectionHeader label="All Friends" count={friends.length} />
          {isLoading ? (
            <Spinner />
          ) : friends.length === 0 ? (
            <EmptyState
              icon={UserPlus}
              title="No friends yet"
              description="Add friends with their username to get started."
              className="py-12"
            />
          ) : (
            friends.map((f) => <FriendRow key={f._id} friend={f} />)
          )}
        </TabsContent>

        {/* Pending */}
        <TabsContent
          value="pending"
          className="mt-0 flex-1 overflow-y-auto p-4"
        >
          {received.length > 0 && (
            <div className="mb-4">
              <SectionHeader label="Incoming" count={received.length} />
              {received.map((r) => (
                <IncomingRow key={r._id} request={r} />
              ))}
            </div>
          )}
          {sent.length > 0 && (
            <div>
              <SectionHeader label="Sent" count={sent.length} />
              {sent.map((r) => (
                <OutgoingRow key={r._id} request={r} />
              ))}
            </div>
          )}
          {received.length === 0 && sent.length === 0 && (
            <EmptyState
              icon={Clock}
              title="No pending requests"
              description="Friend requests you send and receive will appear here."
              className="py-12"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
