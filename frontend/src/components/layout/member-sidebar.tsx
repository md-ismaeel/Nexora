import { useParams } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { useGetServerMembersQuery } from "@/api/server_api";
import { UserAvatar } from "@/components/custom/user-avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/utils";
import { motion, AnimatePresence, vp, makeStagger, Sidebar } from "@/lib/motion";
import type { IServerMember } from "@/types/server.types";
import type { IUser } from "@/types/user.types";

// ── Role ordering & labels ────────────────────────────────────────────────────

const ROLE_ORDER: IServerMember["role"][] = ["owner", "admin", "moderator", "member"];

const ROLE_LABEL: Record<IServerMember["role"], string> = {
    owner: "Owner",
    admin: "Admins",
    moderator: "Moderators",
    member: "Members",
};

// ── Member row ────────────────────────────────────────────────────────────────

function MemberRow({ member }: { member: IServerMember }) {
    const user = member.user as Partial<IUser> & { _id: string };
    const name = user.username ?? user.name ?? "Unknown";
    const isOffline = user.status === "offline" || !user.status;

    return (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <motion.button
                        variants={Sidebar.channelRow}
                        whileHover={{ x: 2, backgroundColor: "rgba(53,54,60,0.6)", transition: { duration: 0.1 } }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            "flex w-full items-center gap-2 rounded px-2 py-[5px] text-left transition-colors",
                            isOffline ? "opacity-50" : "",
                        )}
                    >
                        <UserAvatar
                            name={user.name ?? "?"}
                            avatar={user.avatar}
                            status={user.status as IUser["status"]}
                            size="sm"
                        />
                        <div className="min-w-0 flex-1">
                            <p className={cn(
                                "truncate text-sm font-medium",
                                isOffline ? "text-[#4e5058]" : "text-[#dbdee1]",
                            )}>
                                {name}
                            </p>
                            {user.customStatus && !isOffline && (
                                <p className="truncate text-[10px] text-[#949ba4]">{user.customStatus}</p>
                            )}
                        </div>
                    </motion.button>
                </TooltipTrigger>
                <TooltipContent side="left" className="border-none bg-[#111214] text-white">
                    <p className="font-semibold">{name}</p>
                    {member.nickname && (
                        <p className="text-xs text-[#949ba4]">Nick: {member.nickname}</p>
                    )}
                    <p className="text-xs capitalize text-[#949ba4]">{member.role}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

// ── Role group ────────────────────────────────────────────────────────────────

function RoleGroup({
    role,
    members,
}: {
    role: IServerMember["role"];
    members: IServerMember[];
}) {
    if (members.length === 0) return null;

    return (
        <div className="mb-4">
            <p className="mb-1 px-2 text-[11px] font-bold uppercase tracking-wide text-[#949ba4]">
                {ROLE_LABEL[role]} — {members.length}
            </p>
            <motion.div
                variants={makeStagger({ staggerChildren: 0.02 })}
                initial="hidden"
                animate="visible"
            >
                {members.map((m) => (
                    <MemberRow key={m._id} member={m} />
                ))}
            </motion.div>
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function MemberSidebar() {
    const { serverId } = useParams<{ serverId: string }>();
    const memberListOpen = useAppSelector((s) => s.ui.memberListOpen);

    const { data: membersData, isLoading } = useGetServerMembersQuery(serverId!, {
        skip: !serverId,
    });
    const members = membersData?.data.members ?? [];

    // Group by role
    const grouped = ROLE_ORDER.reduce<Record<string, IServerMember[]>>(
        (acc, role) => {
            acc[role] = members.filter((m) => m.role === role);
            return acc;
        },
        {} as Record<string, IServerMember[]>,
    );

    // Separate online / offline within each group
    const sortByStatus = (list: IServerMember[]) => {
        const user = (m: IServerMember) => m.user as Partial<IUser>;
        const online = list.filter((m) => user(m).status !== "offline");
        const offline = list.filter((m) => user(m).status === "offline");
        return [...online, ...offline];
    };

    return (
        <AnimatePresence>
            {memberListOpen && (
                <motion.aside
                    key="member-sidebar"
                    {...vp(Sidebar.memberPanel)}
                    className="flex w-60 shrink-0 flex-col overflow-y-auto bg-[#2b2d31] px-2 py-4 scrollbar-thin scrollbar-thumb-[#1e1f22]"
                >
                    <p className="mb-3 px-2 text-[11px] font-bold uppercase tracking-wide text-[#949ba4]">
                        Members — {members.length}
                    </p>

                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#5865f2] border-t-transparent" />
                        </div>
                    ) : (
                        ROLE_ORDER.map((role) => (
                            <RoleGroup
                                key={role}
                                role={role}
                                members={sortByStatus(grouped[role] ?? [])}
                            />
                        ))
                    )}
                </motion.aside>
            )}
        </AnimatePresence>
    );
}