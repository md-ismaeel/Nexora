import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    useGetFriendsQuery, useGetAllFriendRequestsQuery,
    useSendFriendRequestMutation, useAcceptFriendRequestMutation,
    useDeclineFriendRequestMutation, useCancelFriendRequestMutation,
    useRemoveFriendMutation,
} from "@/api/friend_api";
import { useSearchUsersQuery } from "@/api/user_api";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { UserAvatar } from "@/components/custom/user-avatar";
import { EmptyState } from "@/components/custom/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { isPopulatedUser } from "@/types/message.types";
import type { IFriendRequest } from "@/types/message.types";
import type { IUser } from "@/types/user.types";
// ── Motion
import { motion, AnimatePresence, vp, makeStagger, Primitives } from "@/lib/motion";
// ── Icons
import { UserIcons, ChatIcons, UIIcons } from "@/lib/lucide";

// ── Add friend ────────────────────────────────────────────────────────────────

function AddFriendBar() {
    const [query, setQuery] = useState("");
    const [localError, setLocalError] = useState<string | null>(null);
    const [successName, setSuccessName] = useState<string | null>(null);
    const [send, { isLoading: sending }] = useSendFriendRequestMutation();

    const { data: searchData, isFetching } = useSearchUsersQuery(
        { q: query.trim() },
        { skip: query.trim().length < 2 },
    );
    const results = searchData?.data.users ?? [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null); setSuccessName(null);
        const trimmed = query.trim();
        if (!trimmed) return;
        const match = results.find(
            (u) => u.username?.toLowerCase() === trimmed.toLowerCase() || u.name.toLowerCase() === trimmed.toLowerCase(),
        );
        if (!match) { setLocalError("No user found with that username."); return; }
        try {
            await send(match._id).unwrap();
            setSuccessName(match.username ?? match.name);
            setQuery("");
        } catch (err) {
            const msg = (err as FetchBaseQueryError & { data?: { message?: string } })?.data?.message;
            setLocalError(msg ?? "Failed to send friend request.");
        }
    };

    return (
        <div className="border-b border-[#3f4147] px-8 py-5">
            <h2 className="mb-1 text-xs font-bold uppercase tracking-wide text-[#dbdee1]">Add Friend</h2>
            <p className="mb-3 text-sm text-[#949ba4]">You can add friends with their username.</p>
            <form onSubmit={handleSubmit} className="flex gap-2">
                <div className="relative flex-1">
                    <UIIcons.Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4e5058]" />
                    <Input
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setLocalError(null); setSuccessName(null); }}
                        placeholder="Enter a username"
                        className="border-none bg-[#1e1f22] pl-9 text-white placeholder:text-[#4e5058] focus-visible:ring-[#5865f2]"
                    />
                </div>
                <Button type="submit" disabled={sending || isFetching || !query.trim()} className="bg-[#5865f2] text-white hover:bg-[#4752c4]">
                    {sending ? "Sending..." : "Send Request"}
                </Button>
            </form>

            <AnimatePresence>
                {query.trim().length >= 2 && results.length > 0 && !successName && (
                    <motion.div {...vp(Primitives.slideDown)} className="mt-2 rounded-lg border border-[#3f4147] bg-[#2b2d31] py-1">
                        {results.slice(0, 5).map((u) => (
                            <button key={u._id} type="button" onClick={() => setQuery(u.username ?? u.name)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[#dbdee1] hover:bg-[#35363c]">
                                <UserAvatar name={u.name} avatar={u.avatar} status={u.status} size="xs" />
                                <span>{u.username ?? u.name}</span>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {successName && <p className="mt-2 text-sm text-green-400">✓ Friend request sent to <strong>{successName}</strong>!</p>}
            {localError && <p className="mt-2 text-sm text-[#ed4245]">{localError}</p>}
        </div>
    );
}

// ── Friend row ────────────────────────────────────────────────────────────────

function FriendRow({ friend }: { friend: IUser }) {
    const navigate = useNavigate();
    const [remove, { isLoading }] = useRemoveFriendMutation();

    return (
        <motion.div
            variants={Primitives.slideUp}
            whileHover={{ backgroundColor: "rgba(53,54,60,0.8)", transition: { duration: 0.1 } }}
            onClick={() => navigate(`/channels/@me/${friend._id}`)}
            className="group flex cursor-pointer items-center gap-3 rounded-lg px-4 py-2"
        >
            <UserAvatar name={friend.name} avatar={friend.avatar} status={friend.status} size="md" />
            <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-[#dbdee1]">{friend.username ?? friend.name}</p>
                <p className="truncate text-xs capitalize text-[#949ba4]">{friend.status}</p>
            </div>
            <TooltipProvider delayDuration={0}>
                <div className="hidden items-center gap-1 group-hover:flex">
                    {[
                        { icon: ChatIcons.Send, label: "Message", action: (e: React.MouseEvent) => { e.stopPropagation(); navigate(`/channels/@me/${friend._id}`); } },
                        { icon: UserIcons.RemoveFriend, label: "Remove Friend", action: (e: React.MouseEvent) => { e.stopPropagation(); remove(friend._id); }, disabled: isLoading, danger: true },
                    ].map(({ icon: Icon, label, action, disabled, danger }) => (
                        <Tooltip key={label}>
                            <TooltipTrigger asChild>
                                <motion.button onClick={action} disabled={disabled}
                                    whileHover={{ scale: 1.12, transition: { type: "spring", stiffness: 420, damping: 30 } }}
                                    whileTap={{ scale: 0.88 }}
                                    className={`flex h-8 w-8 items-center justify-center rounded-full bg-[#2b2d31] text-[#949ba4] ${danger ? "hover:text-[#ed4245]" : "hover:text-white"}`}>
                                    <Icon className="h-4 w-4" />
                                </motion.button>
                            </TooltipTrigger>
                            <TooltipContent>{label}</TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </TooltipProvider>
        </motion.div>
    );
}

// ── Request rows ──────────────────────────────────────────────────────────────

function IncomingRow({ request }: { request: IFriendRequest }) {
    const [accept, { isLoading: accepting }] = useAcceptFriendRequestMutation();
    const [decline, { isLoading: declining }] = useDeclineFriendRequestMutation();
    const sender = isPopulatedUser(request.sender)
        ? request.sender
        : { _id: request.sender as string, name: "Unknown", avatar: undefined, username: undefined };

    return (
        <motion.div variants={Primitives.slideUp} className="flex items-center gap-3 rounded-lg px-4 py-2 hover:bg-[#35363c]">
            <UserAvatar name={sender.name} avatar={sender.avatar} size="md" />
            <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-[#dbdee1]">{sender.username ?? sender.name}</p>
                <p className="text-xs text-[#949ba4]">Incoming Friend Request</p>
            </div>
            <TooltipProvider delayDuration={0}>
                <div className="flex gap-2">
                    {[
                        { icon: UIIcons.Confirm, label: "Accept", action: () => accept(request._id), disabled: accepting, color: "hover:text-green-400" },
                        { icon: UIIcons.Close, label: "Decline", action: () => decline(request._id), disabled: declining, color: "hover:text-[#ed4245]" },
                    ].map(({ icon: Icon, label, action, disabled, color }) => (
                        <Tooltip key={label}>
                            <TooltipTrigger asChild>
                                <motion.button onClick={action} disabled={disabled}
                                    whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.88 }}
                                    className={`flex h-8 w-8 items-center justify-center rounded-full bg-[#2b2d31] text-[#949ba4] ${color}`}>
                                    <Icon className="h-4 w-4" />
                                </motion.button>
                            </TooltipTrigger>
                            <TooltipContent>{label}</TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </TooltipProvider>
        </motion.div>
    );
}

function OutgoingRow({ request }: { request: IFriendRequest }) {
    const [cancel, { isLoading }] = useCancelFriendRequestMutation();
    const receiver = isPopulatedUser(request.receiver)
        ? request.receiver
        : { _id: request.receiver as string, name: "Unknown", avatar: undefined, username: undefined };

    return (
        <motion.div variants={Primitives.slideUp} className="flex items-center gap-3 rounded-lg px-4 py-2 hover:bg-[#35363c]">
            <UserAvatar name={receiver.name} avatar={receiver.avatar} size="md" />
            <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-[#dbdee1]">{receiver.username ?? receiver.name}</p>
                <p className="text-xs text-[#949ba4]">Outgoing Friend Request</p>
            </div>
            <Tooltip>
                <TooltipTrigger asChild>
                    <motion.button onClick={() => cancel(request._id)} disabled={isLoading}
                        whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.88 }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2b2d31] text-[#949ba4] hover:text-[#ed4245]">
                        <UIIcons.Close className="h-4 w-4" />
                    </motion.button>
                </TooltipTrigger>
                <TooltipContent>Cancel Request</TooltipContent>
            </Tooltip>
        </motion.div>
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
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex h-12 items-center gap-3 border-b border-[#3f4147] px-4 shadow-sm"
            >
                <UserIcons.FriendsList className="h-5 w-5 text-[#949ba4]" />
                <span className="font-semibold text-white">Friends</span>
            </motion.div>

            <Tabs defaultValue="online" className="flex flex-1 flex-col overflow-hidden">
                <div className="border-b border-[#3f4147] px-4">
                    <TabsList className="h-12 gap-1 bg-transparent p-0">
                        {[
                            { value: "online", label: "Online", badge: online.length },
                            { value: "all", label: "All", badge: friends.length },
                            { value: "pending", label: "Pending", badge: received.length },
                            { value: "blocked", label: "Blocked", badge: 0 },
                        ].map(({ value, label, badge }) => (
                            <TabsTrigger key={value} value={value}
                                className="rounded px-3 py-1 text-sm text-[#949ba4] data-[state=active]:bg-[#35363c] data-[state=active]:text-white">
                                {label}
                                {badge > 0 && (
                                    <Badge className="ml-1.5 h-4 rounded-full bg-[#ed4245] px-1.5 text-xs text-white">{badge}</Badge>
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {/* Online */}
                <TabsContent value="online" className="mt-0 flex-1 overflow-y-auto">
                    <AddFriendBar />
                    <div className="p-4">
                        <p className="mb-1 px-4 text-xs font-bold uppercase tracking-wide text-[#949ba4]">Online — {online.length}</p>
                        {isLoading ? <div className="flex justify-center py-10"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[#5865f2] border-t-transparent" /></div>
                            : online.length === 0 ? <EmptyState icon={UserIcons.FriendsList} title="No friends online" description="Your online friends will appear here." className="py-12" />
                                : <motion.div variants={makeStagger()} initial="hidden" animate="visible">{online.map((f) => <FriendRow key={f._id} friend={f} />)}</motion.div>}
                    </div>
                </TabsContent>

                {/* All */}
                <TabsContent value="all" className="mt-0 flex-1 overflow-y-auto p-4">
                    <p className="mb-1 px-4 text-xs font-bold uppercase tracking-wide text-[#949ba4]">All Friends — {friends.length}</p>
                    {isLoading ? <div className="flex justify-center py-10"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[#5865f2] border-t-transparent" /></div>
                        : friends.length === 0 ? <EmptyState icon={UserIcons.AddFriend} title="No friends yet" description="Add friends with their username to get started." className="py-12" />
                            : <motion.div variants={makeStagger()} initial="hidden" animate="visible">{friends.map((f) => <FriendRow key={f._id} friend={f} />)}</motion.div>}
                </TabsContent>

                {/* Pending */}
                <TabsContent value="pending" className="mt-0 flex-1 overflow-y-auto p-4">
                    <AnimatePresence>
                        {received.length > 0 && (
                            <div className="mb-4">
                                <p className="mb-1 px-4 text-xs font-bold uppercase tracking-wide text-[#949ba4]">Incoming — {received.length}</p>
                                <motion.div variants={makeStagger()} initial="hidden" animate="visible">
                                    {received.map((r) => <IncomingRow key={r._id} request={r} />)}
                                </motion.div>
                            </div>
                        )}
                        {sent.length > 0 && (
                            <div>
                                <p className="mb-1 px-4 text-xs font-bold uppercase tracking-wide text-[#949ba4]">Sent — {sent.length}</p>
                                <motion.div variants={makeStagger()} initial="hidden" animate="visible">
                                    {sent.map((r) => <OutgoingRow key={r._id} request={r} />)}
                                </motion.div>
                            </div>
                        )}
                        {received.length === 0 && sent.length === 0 && (
                            <EmptyState icon={UIIcons.Clock} title="No pending requests" description="Friend requests you send and receive will appear here." className="py-12" />
                        )}
                    </AnimatePresence>
                </TabsContent>

                {/* Blocked */}
                <TabsContent value="blocked" className="mt-0 flex-1 overflow-y-auto p-4">
                    <EmptyState icon={UserIcons.BlockUser} title="No blocked users" description="Users you block will appear here." className="py-12" />
                </TabsContent>
            </Tabs>
        </div>
    );
}