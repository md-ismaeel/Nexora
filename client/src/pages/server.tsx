import { useEffect } from "react";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import { useGetChannelsQuery } from "@/api/channel.api";
import { useGetServerByIdQuery } from "@/api/server.api";
import { useAppDispatch } from "@/store/hooks";
import { setActiveServer } from "@/store/slices/ui.slice";
import { Hash, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

function NoChannelWelcome({ serverName }: { serverName: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center px-8">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#2b2d31]">
        <Hash className="h-10 w-10 text-[#949ba4]" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white">
          Welcome to {serverName}!
        </h2>
        <p className="mt-2 text-[#949ba4]">
          This server doesn't have any channels yet.
          <br />
          Create one to get started.
        </p>
      </div>
      <Button className="bg-[#5865f2] text-white hover:bg-[#4752c4]">
        <Plus className="mr-2 h-4 w-4" />
        Create Channel
      </Button>
    </div>
  );
}

export default function Server() {
  const { serverId, channelId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data: serverData } = useGetServerByIdQuery(serverId!, { skip: !serverId });
  const { data: channelData } = useGetChannelsQuery(serverId!, { skip: !serverId });

  const server = serverData?.data.server;
  const channels = channelData?.data.channels ?? [];
  const text = channels.filter((c) => c.type === "text");

  // Track active server in Redux
  useEffect(() => {
    if (serverId) dispatch(setActiveServer(serverId));
    return () => { dispatch(setActiveServer(null)); };
  }, [serverId, dispatch]);

  // Auto-redirect to first text channel
  useEffect(() => {
    if (!channelId && text.length > 0 && serverId) {
      navigate(`/servers/${serverId}/${text[0]._id}`, { replace: true });
    }
  }, [channelId, text, serverId, navigate]);

  // If a channel is selected, render it
  if (channelId) return <Outlet />;

  // Waiting for data
  if (!channelData) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5865f2] border-t-transparent" />
      </div>
    );
  }

  // No channels at all
  return <NoChannelWelcome serverName={server?.name ?? "this server"} />;
}