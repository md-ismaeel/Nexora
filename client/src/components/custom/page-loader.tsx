import { motion } from "@/lib/motion";

interface PageLoaderProps {
  message?: string;
  /** If true renders inline (doesn't take full screen) */
  inline?: boolean;
}

export function PageLoader({
  message = "Loading...",
  inline = false,
}: PageLoaderProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.2 } }}
      className="flex flex-col items-center gap-4"
    >
      {/* Spinner */}
      <div className="relative h-12 w-12">
        <div className="h-12 w-12 rounded-full border-4 border-[#5865f2]/20" />
        <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent border-t-[#5865f2]" />
      </div>
      <p className="text-sm text-[#b5bac1]">{message}</p>
    </motion.div>
  );

  if (inline) {
    return (
      <div className="flex items-center justify-center py-10">{content}</div>
    );
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#313338]">
      {content}
    </div>
  );
}