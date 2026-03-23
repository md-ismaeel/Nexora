import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetChannelsQuery } from "@/api/channel_api";
import { useGetServerByIdQuery } from "@/api/server_api";
import { useAppDispatch } from "@/store/hooks";
import { setActiveServer } from "@/store/slices/ui_slice";
import { openModal } from "@/store/slices/ui_slice";
import { Hash, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

function NoChannelWelcome({ serverName, onCreateChannel }: { serverName: string; onCreateChannel: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#2b2d31]">
        <Hash className="h-10 w-10 text-[#949ba4]" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white">Welcome to {serverName}!</h2>
        <p className="mt-2 text-[#949ba4]">
          This server doesn't have any channels yet.
          <br />
          Create one to get started.
        </p>
      </div>
      {/* FIX: was missing onClick — button did nothing */}
      <Button onClick={onCreateChannel} className="bg-[#5865f2] text-white hover:bg-[#4752c4]">
        <Plus className="mr-2 h-4 w-4" />
        Create Channel
      </Button>
    </div>
  );
}

export default function Server() {
  const { serverId } = useParams<{ serverId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data: serverData } = useGetServerByIdQuery(serverId!, { skip: !serverId });
  // FIX: added isLoading to distinguish "loading" from "loaded but empty"
  const { data: channelData, isLoading: channelsLoading } = useGetChannelsQuery(serverId!, { skip: !serverId });

  const server = serverData?.data.server;
  const channels = channelData?.data.channels ?? [];

  // FIX: memoize filtered list — inline filter creates a new array reference on
  // every render, causing the auto-redirect useEffect to re-run unnecessarily
  const textChannels = useMemo(
    () => channels.filter((c) => c.type === "text"),
    [channels],
  );

  // Track active server in Redux (ui.slice)
  useEffect(() => {
    if (serverId) dispatch(setActiveServer(serverId));
    return () => { dispatch(setActiveServer(null)); };
  }, [serverId, dispatch]);

  // Auto-redirect to first text channel once channels load
  useEffect(() => {
    if (!channelsLoading && textChannels.length > 0 && serverId) {
      navigate(`/servers/${serverId}/${textChannels[0]._id}`, { replace: true });
    }
  }, [channelsLoading, textChannels, serverId, navigate]);

  // While channels are loading show a spinner
  if (channelsLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5865f2] border-t-transparent" />
      </div>
    );
  }

  // No text channels at all
  return (
    <NoChannelWelcome
      serverName={server?.name ?? "this server"}
      // FIX: dispatch openModal so the Create Channel modal can open
      onCreateChannel={() =>
        dispatch(openModal({ modal: "createChannel", data: { serverId } }))
      }
    />
  );
}