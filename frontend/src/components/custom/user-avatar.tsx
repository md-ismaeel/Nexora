import { Avatar, Tooltip } from "@heroui/react";
import { cn, getInitials } from "@/utils/utils";
import { motion } from "@/utils/motion";

export type UserStatus = "online" | "offline" | "away" | "dnd";

export interface UserAvatarProps {
  name: string;
  avatar?: string;
  status?: UserStatus;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showStatusTooltip?: boolean;
  interactive?: boolean;
}

// Map our size tokens → Tailwind size classes on the Avatar wrapper
const sizeClass: Record<NonNullable<UserAvatarProps["size"]>, string> = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-16 text-xl",
};

const dotSize: Record<NonNullable<UserAvatarProps["size"]>, string> = {
  xs: "h-2 w-2 border",
  sm: "h-2.5 w-2.5 border",
  md: "h-3 w-3 border-2",
  lg: "h-3.5 w-3.5 border-2",
  xl: "h-4 w-4 border-2",
};

const statusColor: Record<UserStatus, string> = {
  online: "bg-green-500",
  away: "bg-yellow-500",
  dnd: "bg-red-500",
  offline: "bg-[#747f8d]",
};

const statusLabel: Record<UserStatus, string> = {
  online: "Online",
  away: "Away",
  dnd: "Do Not Disturb",
  offline: "Offline",
};

export function UserAvatar({
  name,
  avatar,
  status,
  size = "md",
  className,
  showStatusTooltip = false,
  interactive = false,
}: UserAvatarProps) {

  // ── Avatar element ──────────────────────────────────────────────────────────
  // v3 Avatar — compound component:
  //   <Avatar>
  //     <Avatar.Image src alt />          ← shown when src loads
  //     <Avatar.Fallback>{initials}</>   ← shown when no src / on error
  //   </Avatar>
  const avatarEl = (
    <div className="relative inline-flex shrink-0">
      <Avatar className={cn(sizeClass[size], "rounded-full bg-[#5865f2]", className)}>
        {avatar && <Avatar.Image src={avatar} alt={name} />}
        <Avatar.Fallback>{getInitials(name)}</Avatar.Fallback>
      </Avatar>

      {status && (
        <span
          aria-label={statusLabel[status]}
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-[#2b2d31]",
            statusColor[status],
            dotSize[size],
          )}
        />
      )}
    </div>
  );

  // ── Spring hover wrapper ────────────────────────────────────────────────────
  const wrapped = interactive ? (
    <motion.div
      whileHover={{ scale: 1.08, transition: { type: "spring", stiffness: 420, damping: 30 } }}
      whileTap={{ scale: 0.95 }}
      className="inline-flex"
    >
      {avatarEl}
    </motion.div>
  ) : avatarEl;

  // ── Optional status tooltip ─────────────────────────────────────────────────
  // v3 Tooltip — compound:
  //   <Tooltip>
  //     <Tooltip.Trigger>  ← wraps the trigger element
  //     <Tooltip.Content>  ← floating label
  if (showStatusTooltip && status) {
    return (
      <Tooltip>
        <Tooltip.Trigger>
          <span className="inline-flex">{wrapped}</span>
        </Tooltip.Trigger>
        <Tooltip.Content>{statusLabel[status]}</Tooltip.Content>
      </Tooltip>
    );
  }

  return <>{wrapped}</>;
}

export default UserAvatar;