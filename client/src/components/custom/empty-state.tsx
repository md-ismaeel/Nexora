import { cn } from "@/lib/utils/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-8 text-center",
        className,
      )}
    >
      <Icon className="h-16 w-16 text-[#4e5058]" />
      <div>
        <p className="text-lg font-semibold text-[#dbdee1]">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-[#949ba4]">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
