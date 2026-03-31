import { useParams } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { useGetServerMembersQuery } from "@/api/server_api";
import { UserAvatar } from "@/components/custom/user-avatar";
import { Tooltip, Skeleton, ScrollShadow } from "@heroui/react";
import { cn } from "@/utils/utils";
import { motion, AnimatePresence, vp, makeStagger, Sidebar } from "@/utils/motion";
import type { IServerMember } from "@/types/server.types";
import type { IUser } from "@/types/user.types";

// ── Constants ─────────────────────────────────────────────────────────────────

const ROLE_ORDER: IServerMember["role"][] = ["owner", "admin", "moderator", "member"];

const ROLE_LABEL: Record<IServerMember["role"], string> = {
    owner: "Owner",
    admin: "Admins",
    moderator: "Moderators",
    member: "Members",
};

// ── Skeleton loading rows ─────────────────────────────────────────────────────

function MemberSkeletons() {
    return (
        <div className="space-y-2 px-2 pt-2">
            {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1">
                    {/*
            HeroUI v3 Skeleton — simple component.
            Pass className to set dimensions & shape.
          */}
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex flex-1 flex-col gap-1">
                        <Skeleton className="h-3 w-24 rounded" />
                        <Skeleton className="h-2 w-16 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Member row ────────────────────────────────────────────────────────────────

function MemberRow({ member }: { member: IServerMember }) {
    const user = member.user as Partial<IUser> & { _id: string };
    const name = user.username ?? user.name ?? "Unknown";
    const isOffline = !user.status || user.status === "offline";

    return (
        /*
          HeroUI v3 Tooltip — compound pattern:
            <Tooltip>
              <Tooltip.Trigger asChild>  ← passes through to child element
              <Tooltip.Content side="left">  ← floating panel
        */
        <Tooltip>
            <Tooltip.Trigger>
                <motion.button
                    variants={Sidebar.channelRow}
                    whileHover={{
                        x: 2,
                        backgroundColor: "rgba(53,54,60,0.6)",
                        transition: { duration: 0.1 },
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                        "flex w-full items-center gap-2 rounded px-2 py-[5px] text-left transition-colors",
                        isOffline && "opacity-50",
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
                            <p className="truncate text-[10px] text-[#949ba4]">
                                {user.customStatus}
                            </p>
                        )}
                    </div>
                </motion.button>
            </Tooltip.Trigger>

            <Tooltip.Content placement="left">
                <p className="font-semibold text-white">{name}</p>
                {member.nickname && (
                    <p className="text-xs text-[#949ba4]">Nick: {member.nickname}</p>
                )}
                <p className="text-xs capitalize text-[#949ba4]">{member.role}</p>
            </Tooltip.Content>
        </Tooltip>
    );
}

// ── Role group ────────────────────────────────────────────────────────────────

function RoleGroup({ role, members }: { role: IServerMember["role"]; members: IServerMember[] }) {
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
                {members.map((m) => <MemberRow key={m._id} member={m} />)}
            </motion.div>
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function MemberSidebar() {
    const { serverId } = useParams<{ serverId: string }>();
    const memberListOpen = useAppSelector((s) => s.ui.memberListOpen);

    const { data, isLoading } = useGetServerMembersQuery(serverId!, { skip: !serverId });
    const members = data?.data ?? [] as IServerMember[];

    const grouped = ROLE_ORDER.reduce<Record<string, IServerMember[]>>(
        (acc, role) => ({ ...acc, [role]: members.filter((m) => m.role === role) }),
        {} as Record<string, IServerMember[]>,
    );

    const sortByStatus = (list: IServerMember[]) => {
        const status = (m: IServerMember) => (m.user as Partial<IUser>).status;
        return [
            ...list.filter((m) => status(m) !== "offline"),
            ...list.filter((m) => status(m) === "offline"),
        ];
    };

    return (
        <AnimatePresence>
            {memberListOpen && (
                <motion.aside
                    key="member-sidebar"
                    {...vp(Sidebar.memberPanel)}
                    className="flex w-60 shrink-0 flex-col bg-[#2b2d31]"
                >
                    {/* Header */}
                    <div className="border-b border-[#1e1f22] px-4 py-3">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-[#949ba4]">
                            Members — {members.length}
                        </p>
                    </div>

                    {/*
            HeroUI v3 ScrollShadow — adds a gradient fade at the scroll edges
            to hint that there is more content to scroll to.
          */}
                    <ScrollShadow className="flex-1 overflow-y-auto px-2 py-3">
                        {isLoading
                            ? <MemberSkeletons />
                            : ROLE_ORDER.map((role) => (
                                <RoleGroup
                                    key={role}
                                    role={role}
                                    members={sortByStatus(grouped[role] ?? [])}
                                />
                            ))
                        }
                    </ScrollShadow>
                </motion.aside>
            )}
        </AnimatePresence>
    );
}