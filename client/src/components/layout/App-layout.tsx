import { Outlet } from "react-router-dom";
import ServerSidebar from "@/components/layout/server-sidebar";
import ChannelSidebar from "@/components/layout/channel-sidebar";
import { useSocket } from "@/hooks/use-socket";

export default function AppLayout() {
  // Connects socket when authenticated, tears down on logout
  useSocket();

  return (
    <div className="flex h-screen overflow-hidden bg-[#313338]">
      {/* Col 1 — server icon rail (72px fixed) */}
      <ServerSidebar />

      {/* Col 2 — channel / DM sidebar (240px fixed) */}
      <ChannelSidebar />

      {/* Col 3 — main content */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
