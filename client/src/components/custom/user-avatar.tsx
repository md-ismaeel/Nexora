import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn, getInitials } from "@/lib/utils/utils";
import { motion } from "@/lib/motion";

// ── Types ─────────────────────────────────────────────────────────────────────

export type UserStatus = "online" | "offline" | "away" | "dnd";

export interface UserAvatarProps {
  name: string;
  avatar?: string;
  status?: UserStatus;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  /** Show a tooltip with the user's status on hover */
  showStatusTooltip?: boolean;
  /** Animate avatar on hover (used in member list / user panel) */
  interactive?: boolean;
}

// ── Size maps ─────────────────────────────────────────────────────────────────

const avatarSizeMap: Record<NonNullable<UserAvatarProps["size"]>, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

const statusDotSizeMap: Record<NonNullable<UserAvatarProps["size"]>, string> = {
  xs: "h-2 w-2 border",
  sm: "h-2.5 w-2.5 border",
  md: "h-3 w-3 border-2",
  lg: "h-3.5 w-3.5 border-2",
  xl: "h-4 w-4 border-2",
};

const statusColorMap: Record<UserStatus, string> = {
  online: "bg-green-500",
  away: "bg-yellow-500",
  dnd: "bg-red-500",
  offline: "bg-[#747f8d]",
};

const statusLabelMap: Record<UserStatus, string> = {
  online: "Online",
  away: "Away",
  dnd: "Do Not Disturb",
  offline: "Offline",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function UserAvatar({
  name,
  avatar,
  status,
  size = "md",
  className,
  showStatusTooltip = false,
  interactive = false,
}: UserAvatarProps) {
  const avatarEl = (
    <div className="relative inline-flex shrink-0">
      <Avatar className={cn(avatarSizeMap[size], className)}>
        <AvatarImage src={avatar} alt={name} />
        <AvatarFallback className="bg-[#5865f2] font-semibold text-white">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-[#2b2d31]",
            statusColorMap[status],
            statusDotSizeMap[size],
          )}
          aria-label={statusLabelMap[status]}
        />
      )}
    </div>
  );

  // Wrap in motion for interactive usage (hover scale)
  const wrapped = interactive ? (
    <motion.div
      whileHover={{ scale: 1.08, transition: { type: "spring", stiffness: 420, damping: 30 } }}
      whileTap={{ scale: 0.95 }}
      className="inline-flex"
    >
      {avatarEl}
    </motion.div>
  ) : avatarEl;

  // Optionally show status tooltip
  if (showStatusTooltip && status) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>{wrapped}</span>
          </TooltipTrigger>
          <TooltipContent side="top">{statusLabelMap[status]}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <>{wrapped}</>;
}

export default UserAvatar;