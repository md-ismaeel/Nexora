// app-layout.tsx — three-column Discord-style shell
// Col 1  72px   ServerSidebar
// Col 2  240px  ChannelSidebar
// Col 3  flex   <Outlet />
// Col 4  240px  MemberSidebar (server routes only)

import { Outlet, useParams } from "react-router-dom";
import ServerSidebar from "@/components/layout/server-sidebar";
import ChannelSidebar from "@/components/layout/channel-sidebar";
import MemberSidebar from "@/components/layout/member-sidebar";
import { useSocket } from "@/hooks/use-socket";

export default function AppLayout() {
  useSocket(); // Socket connection lives for the whole authenticated session
  const { serverId } = useParams();

  return (
    <div className="flex h-screen overflow-hidden bg-[#313338]">
      <ServerSidebar />
      <ChannelSidebar />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
      {serverId && <MemberSidebar />}
    </div>
  );
}