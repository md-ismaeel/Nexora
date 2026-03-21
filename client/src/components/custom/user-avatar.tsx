import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils/utils";

interface UserAvatarProps {
  name: string;
  avatar?: string;
  status?: "online" | "offline" | "away" | "dnd";
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

const statusColor = {
  online: "bg-green-500",
  away: "bg-yellow-500",
  dnd: "bg-red-500",
  offline: "bg-[#747f8d]",
};

const statusSize = {
  xs: "h-2 w-2 border",
  sm: "h-2.5 w-2.5 border",
  md: "h-3 w-3 border-2",
  lg: "h-3.5 w-3.5 border-2",
};

export function UserAvatar({ name, avatar, status, size = "md", className }: UserAvatarProps) {
  return (
    <div className="relative inline-flex shrink-0">
      <Avatar className={cn(sizeMap[size], className)}>
        <AvatarImage src={avatar} alt={name} />
        <AvatarFallback className="bg-[#5865f2] text-white font-semibold">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-[#2b2d31]",
            statusColor[status],
            statusSize[size],
          )}
        />
      )}
    </div>
  );
}
