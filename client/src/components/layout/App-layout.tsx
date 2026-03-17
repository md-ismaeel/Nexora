import { Outlet } from "react-router-dom";
import ServerSidebar from "@/Sidebar/server-sidebar";
import ChannelSidebar from "@/Sidebar/channel-sidebar";

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#313338]">
      {/* Col 1 — server icon rail (72px) */}
      <ServerSidebar />

      {/* Col 2 — channel / DM list (240px) */}
      <ChannelSidebar />

      {/* Col 3 — main content area */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
