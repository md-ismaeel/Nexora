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

// HeroUI Avatar accepts sm | md | lg natively
const heroSize: Record<NonNullable<UserAvatarProps["size"]>, "sm" | "md" | "lg"> = {
  xs: "sm", sm: "sm", md: "md", lg: "lg", xl: "lg",
};

// Size overrides for xs/xl (outside HeroUI's native range)
const sizeOverride: Partial<Record<NonNullable<UserAvatarProps["size"]>, string>> = {
  xs: "!size-6 !text-[10px]",
  xl: "!size-16 !text-xl",
};

const dotSize: Record<NonNullable<UserAvatarProps["size"]>, string> = {
  xs: "h-2 w-2 border",
  sm: "h-2.5 w-2.5 border",
  md: "h-3 w-3 border-2",
  lg: "h-3.5 w-3.5 border-2",
  xl: "h-4 w-4 border-2",
};

const statusColor: Record<UserStatus, string> = {
  online: "bg-green-500", away: "bg-yellow-500",
  dnd: "bg-red-500", offline: "bg-[#747f8d]",
};

const statusLabel: Record<UserStatus, string> = {
  online: "Online", away: "Away", dnd: "Do Not Disturb", offline: "Offline",
};

export function UserAvatar({
  name, avatar, status, size = "md", className,
  showStatusTooltip = false, interactive = false,
}: UserAvatarProps) {

  const avatarEl = (
    <div className="relative inline-flex shrink-0">
      {/*
        HeroUI v3 Avatar — compound component.
          Avatar.Image   → image slot (falls back silently on error)
          Avatar.Fallback → shown when image absent / fails
          color="accent"  → brand indigo tint on the fallback
      */}
      <Avatar size={heroSize[size]} color="accent" className={cn(sizeOverride[size], className)}>
        <Avatar.Image src={avatar} alt={name} />
        <Avatar.Fallback>{getInitials(name)}</Avatar.Fallback>
      </Avatar>

      {status && (
        <span
          aria-label={statusLabel[status]}
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-[#2b2d31]",
            statusColor[status], dotSize[size],
          )}
        />
      )}
    </div>
  );

  const wrapped = interactive ? (
    <motion.div
      whileHover={{ scale: 1.08, transition: { type: "spring", stiffness: 420, damping: 30 } }}
      whileTap={{ scale: 0.95 }}
      className="inline-flex"
    >{avatarEl}</motion.div>
  ) : avatarEl;

  if (showStatusTooltip && status) {
    /*
      HeroUI v3 Tooltip — compound component:
        <Tooltip>
          <Tooltip.Trigger asChild>  ← merges into the child element (no extra DOM node)
          <Tooltip.Content>         ← the floating label
    */
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