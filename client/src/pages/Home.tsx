import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import { motion, Primitives, vp } from "@/lib/motion";
import { SidebarIcons } from "@/lib/lucide";

export default function HomePage() {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const isLoading = useAppSelector((s) => s.auth.isLoading);

  // Redirect authenticated users to the app
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/channels/@me", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden bg-[#313338] text-center">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5865f2] opacity-10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 translate-x-1/2 translate-y-1/2 rounded-full bg-[#7289da] opacity-10 blur-3xl" />
      </div>

      <motion.div
        {...vp(Primitives.fade)}
        className="relative flex flex-col items-center gap-6"
      >
        {/* Brand icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, transition: { type: "spring", stiffness: 260, damping: 20, delay: 0.1 } }}
          className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#5865f2]"
        >
          <SidebarIcons.DirectMessages className="h-10 w-10 text-white" />
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
        >
          <h1 className="text-5xl font-bold text-white">Discord App</h1>
          <p className="mt-3 text-lg text-[#b5bac1]">
            Chat with friends, join communities, and build something great.
          </p>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { delay: 0.3 } }}
          className="flex gap-3"
        >
          <Button
            onClick={() => navigate("/login")}
            className="h-11 bg-[#5865f2] px-8 text-base font-medium text-white hover:bg-[#4752c4]"
          >
            Log In
          </Button>
          <Button
            onClick={() => navigate("/register")}
            variant="outline"
            className="h-11 border-[#4e5058] px-8 text-base text-white hover:bg-[#35363c]"
          >
            Register
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}