import { useEffect, useMemo } from "react";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import { useGetChannelsQuery } from "@/api/channel_api";
import { useGetServerByIdQuery } from "@/api/server_api";
import { useAppDispatch } from "@/store/hooks";
import { setActiveServer } from "@/store/slices/ui_slice";
import { openModal } from "@/store/slices/ui_slice";
import { Button } from "@/components/ui/button";
import { motion } from "@/lib/motion";
import { SidebarIcons, UIIcons } from "@/lib/lucide";

function NoChannelWelcome({ serverName, onCreateChannel }: { serverName: string; onCreateChannel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1, transition: { type: "spring", stiffness: 260, damping: 24 } }}
      className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#2b2d31]">
        <SidebarIcons.TextChannel className="h-10 w-10 text-[#949ba4]" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white">Welcome to {serverName}!</h2>
        <p className="mt-2 text-[#949ba4]">This server doesn't have any channels yet.<br />Create one to get started.</p>
      </div>
      <Button onClick={onCreateChannel} className="bg-[#5865f2] text-white hover:bg-[#4752c4]">
        <UIIcons.Add className="mr-2 h-4 w-4" />
        Create Channel
      </Button>
    </motion.div>
  );
}

export default function Server() {
  const { serverId } = useParams<{ serverId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data: serverData } = useGetServerByIdQuery(serverId!, { skip: !serverId });
  const { data: channelData, isLoading } = useGetChannelsQuery(serverId!, { skip: !serverId });

  const server = serverData?.data.server;
  const channels = channelData?.data.channels ?? [];
  const textChannels = useMemo(() => channels.filter((c) => c.type === "text"), [channels]);

  useEffect(() => {
    if (serverId) dispatch(setActiveServer(serverId));
    return () => { dispatch(setActiveServer(null)); };
  }, [serverId, dispatch]);

  useEffect(() => {
    if (!isLoading && textChannels.length > 0 && serverId) {
      navigate(`/servers/${serverId}/${textChannels[0]._id}`, { replace: true });
    }
  }, [isLoading, textChannels, serverId, navigate]);

  // If channelId is in the URL, render the channel via Outlet
  // (this component is the parent of :channelId route)
  const { channelId } = useParams<{ channelId: string }>();
  if (channelId) return <Outlet />;

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5865f2] border-t-transparent" />
      </div>
    );
  }

  return (
    <NoChannelWelcome
      serverName={server?.name ?? "this server"}
      onCreateChannel={() => dispatch(openModal({ modal: "createChannel", data: { serverId } }))}
    />
  );
}