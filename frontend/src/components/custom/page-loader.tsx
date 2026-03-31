import { Spinner } from "@heroui/react";
import { motion } from "@/utils/motion";

interface PageLoaderProps {
  message?: string;
  /** Render inline, not full-screen */
  inline?: boolean;
}

export function PageLoader({ message = "Loading...", inline = false }: PageLoaderProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.2 } }}
      className="flex flex-col items-center gap-4"
    >
      {/* HeroUI v3 Spinner — simple component, size: "sm" | "md" | "lg" */}
      <Spinner size="lg" />
      <p className="text-sm text-[#b5bac1]">{message}</p>
    </motion.div>
  );

  if (inline) return <div className="flex items-center justify-center py-10">{content}</div>;

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#313338]">
      {content}
    </div>
  );
}