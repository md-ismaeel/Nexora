import { Outlet, useParams } from "react-router-dom";
import ServerSidebar from "@/components/layout/server-sidebar";
import ChannelSidebar from "@/components/layout/channel-sidebar";
import MemberSidebar from "@/components/layout/member-sidebar";
import { useSocket } from "@/hooks/use-socket";

/**
 * AppLayout — three-column shell for all authenticated routes.
 *
 * Col 1 (72px)   ServerSidebar  — server icon rail
 * Col 2 (240px)  ChannelSidebar — channels or DM list
 * Col 3 (flex)   <Outlet />     — page content
 * Col 4 (240px)  MemberSidebar  — server member list (only on server routes,
 *                                  toggled via ui.memberListOpen)
 *
 * useSocket() runs here — connection lives for the whole authenticated session.
 */
export default function AppLayout() {
  useSocket();
  const { serverId } = useParams();

  return (
    <div className="flex h-screen overflow-hidden bg-[#313338]">
      {/* Col 1 — server icon rail */}
      <ServerSidebar />

      {/* Col 2 — channel / DM sidebar */}
      <ChannelSidebar />

      {/* Col 3 — main content */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>

      {/* Col 4 — member list (only shown when inside a server) */}
      {serverId && <MemberSidebar />}
    </div>
  );
}