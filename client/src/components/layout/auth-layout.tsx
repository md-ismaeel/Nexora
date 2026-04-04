import { Outlet } from "react-router-dom";
import { motion, Modals, vp } from "@/utils/motion";

export default function AuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#313338] p-4">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#5865f2] opacity-10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#7289da] opacity-10 blur-3xl" />
      </div>

      <motion.div {...vp(Modals.dialog)} className="relative z-10 w-full max-w-md px-4">
        <Outlet />
      </motion.div>
    </div>
  );
}