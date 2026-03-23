import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { useGetInviteQuery, useJoinServerMutation } from "@/api/server_api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence, Modals, vp } from "@/lib/motion";
import { ServerIcons, UserIcons, UIIcons } from "@/lib/lucide";

export default function InvitePage() {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

    const { data, isLoading, isError } = useGetInviteQuery(code!, { skip: !code });
    const [joinServer, { isLoading: joining, isSuccess, isError: joinError }] = useJoinServerMutation();

    const invite = data?.data.invite;
    const server = invite?.server as { name?: string; icon?: string; description?: string; memberCount?: number } | undefined;

    const handleJoin = async () => {
        if (!isAuthenticated) {
            navigate("/login", { state: { from: `/invite/${code}` } });
            return;
        }
        if (!code) return;
        try {
            await joinServer(code).unwrap();
        } catch {
            // joinError handles display
        }
    };

    const handleSuccess = () => {
        navigate("/channels/@me");
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#313338]">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#5865f2] border-t-transparent" />
            </div>
        );
    }

    if (isError || !invite) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#313338] px-4">
                <motion.div {...vp(Modals.dialog)} className="w-full max-w-md rounded-xl bg-[#2b2d31] p-8 text-center shadow-2xl">
                    <UIIcons.Error className="mx-auto mb-4 h-16 w-16 text-[#ed4245]" />
                    <h1 className="text-2xl font-bold text-white">Invalid Invite</h1>
                    <p className="mt-2 text-sm text-[#949ba4]">This invite link is invalid, expired, or has reached its maximum uses.</p>
                    <Button onClick={() => navigate("/")} className="mt-6 bg-[#5865f2] text-white hover:bg-[#4752c4]">
                        Go Home
                    </Button>
                </motion.div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#313338]">
                <motion.div {...vp(Modals.dialog)} className="w-full max-w-md rounded-xl bg-[#2b2d31] p-8 text-center shadow-2xl">
                    <UIIcons.Success className="mx-auto mb-4 h-16 w-16 text-green-400" />
                    <h1 className="text-2xl font-bold text-white">You're in!</h1>
                    <p className="mt-2 text-sm text-[#949ba4]">Welcome to <strong className="text-white">{server?.name}</strong>!</p>
                    <Button onClick={handleSuccess} className="mt-6 bg-[#5865f2] text-white hover:bg-[#4752c4]">
                        Open Server
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#313338] px-4">
            {/* Background blobs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-1/4 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5865f2] opacity-10 blur-3xl" />
                <div className="absolute right-1/4 bottom-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-[#7289da] opacity-10 blur-3xl" />
            </div>

            <motion.div
                {...vp(Modals.dialog)}
                className="relative w-full max-w-md rounded-xl bg-[#2b2d31] shadow-2xl overflow-hidden"
            >
                {/* Banner / header */}
                <div className="flex flex-col items-center gap-3 bg-[#232428] px-8 pt-8 pb-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#5865f2] text-2xl font-bold text-white overflow-hidden">
                        {server?.icon ? (
                            <img src={server.icon} alt={server.name} className="h-full w-full object-cover" />
                        ) : (
                            <span>{server?.name?.slice(0, 2).toUpperCase() ?? "??"}</span>
                        )}
                    </div>

                    <div className="text-center">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#949ba4]">
                            You have been invited to join
                        </p>
                        <h1 className="mt-1 text-2xl font-bold text-white">{server?.name ?? "Unknown Server"}</h1>
                        {server?.description && (
                            <p className="mt-1 text-sm text-[#949ba4]">{server.description}</p>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-1.5 text-sm text-[#949ba4]">
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                            Online
                        </div>
                        {server?.memberCount != null && (
                            <div className="flex items-center gap-1.5 text-sm text-[#949ba4]">
                                <UserIcons.FriendsList className="h-3.5 w-3.5" />
                                {server.memberCount.toLocaleString()} members
                            </div>
                        )}
                    </div>
                </div>

                <Separator className="bg-[#1e1f22]" />

                {/* Invite metadata */}
                <div className="px-8 py-4 space-y-2">
                    {invite.maxUses != null && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[#949ba4]">Max uses</span>
                            <Badge variant="secondary" className="bg-[#404249] text-[#dbdee1]">
                                {invite.uses} / {invite.maxUses}
                            </Badge>
                        </div>
                    )}
                    {invite.expiresAt && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[#949ba4]">Expires</span>
                            <Badge variant="secondary" className="bg-[#404249] text-[#dbdee1]">
                                {new Date(invite.expiresAt).toLocaleDateString()}
                            </Badge>
                        </div>
                    )}
                </div>

                {/* CTA */}
                <div className="px-8 pb-8">
                    <AnimatePresence>
                        {joinError && (
                            <motion.p {...vp(Modals.backdrop)} className="mb-3 text-center text-sm text-[#ed4245]">
                                Failed to join server. Please try again.
                            </motion.p>
                        )}
                    </AnimatePresence>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            onClick={handleJoin}
                            disabled={joining}
                            className="w-full h-11 bg-[#5865f2] text-base font-medium text-white hover:bg-[#4752c4] disabled:opacity-60"
                        >
                            {joining ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Joining...
                                </span>
                            ) : isAuthenticated ? (
                                <>
                                    <ServerIcons.CommunityServer className="mr-2 h-5 w-5" />
                                    Accept Invite
                                </>
                            ) : (
                                "Login to Join"
                            )}
                        </Button>
                    </motion.div>

                    {!isAuthenticated && (
                        <p className="mt-3 text-center text-xs text-[#949ba4]">
                            You need to be logged in to join this server.
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
}