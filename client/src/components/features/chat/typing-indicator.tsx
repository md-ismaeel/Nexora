import { UserAvatar } from "@/components/custom/user-avatar";
import { cn } from "@/utils/utils";
import type { PopulatedUser } from "@/types/message.types";

export interface TypingIndicatorProps {
  users: PopulatedUser[];
  className?: string;
}

export function TypingIndicator({ users, className }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const getText = () => {
    if (users.length === 1) {
      return `${users[0].name} is typing`;
    }
    if (users.length === 2) {
      return `${users[0].name} and ${users[1].name} are typing`;
    }
    if (users.length === 3) {
      return `${users[0].name}, ${users[1].name} and ${users[2].name} are typing`;
    }
    return `${users[0].name} and ${users.length - 1} others are typing`;
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-1 text-sm text-[#b5bac1]",
        className
      )}
    >
      <div className="flex -space-x-2">
        {users.slice(0, 3).map((user) => (
          <div key={user._id} className="ring-2 ring-[#313338] rounded-full">
            <UserAvatar name={user.name} avatar={user.avatar} size="xs" />
          </div>
        ))}
      </div>
      <span className="italic">{getText()}...</span>
      <span className="flex gap-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#b5bac1] animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#b5bac1] animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#b5bac1] animate-bounce" />
      </span>
    </div>
  );
}

export default TypingIndicator;
