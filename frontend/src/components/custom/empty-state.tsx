import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/utils";
import { motion } from "@/utils/motion";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  /** If true the icon pulses — useful for loading-adjacent states */
  animate?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
  animate = false,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-8 text-center",
        className,
      )}
    >
      <Icon
        className={cn(
          "h-16 w-16 text-[#4e5058]",
          animate && "animate-pulse",
        )}
      />
      <div>
        <p className="text-lg font-semibold text-[#dbdee1]">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-[#949ba4]">{description}</p>
        )}
      </div>
      {children}
    </motion.div>
  );
}