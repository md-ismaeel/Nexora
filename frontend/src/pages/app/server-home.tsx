import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, Avatar, AvatarImage, AvatarFallback, Button, Spinner } from "@heroui/react";
import { Hash as HashIcon, Users as UsersIcon, Settings as SettingsIcon, Plus as PlusIcon } from "@/utils/lucide";
import { useGetServerByIdQuery, useGetServerMembersQuery } from "@/api/server_api";
import { useGetChannelsQuery } from "@/api/channel_api";
import type { IChannel } from "@/types/server.types";

export default function ServerHomePage() {
  const { serverId } = useParams();
  const navigate = useNavigate();

  const { data: serverData, isLoading: serverLoading } = useGetServerByIdQuery(serverId!, { skip: !serverId });
  const { data: channelsData } = useGetChannelsQuery(serverId!, { skip: !serverId });
  const { data: membersData } = useGetServerMembersQuery(serverId!, { skip: !serverId });

  const server = serverData?.data;
  const channels = (channelsData?.data ?? []) as IChannel[];
  const members = membersData?.data ?? [];

  if (serverLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#313338]">
        <Spinner color="accent" />
      </div>
    );
  }

  if (!server) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#313338]">
        <Card className="w-96">
          <CardContent className="text-center py-8">
            <p className="text-[#949ba4]">Server not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleChannelClick = (channel: IChannel) => {
    navigate(`/servers/${serverId}/${channel._id}`);
  };

  const handleSettingsClick = () => {
    navigate(`/servers/${serverId}/settings`);
  };

  const textChannels = channels.filter((c) => c.type === "text");
  const voiceChannels = channels.filter((c) => c.type === "voice");

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#313338]">
      <div className="flex items-center justify-between px-4 h-12 border-b border-[#1f2023]">
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-white">{server.name}</h1>
        </div>
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          onPress={handleSettingsClick}
          className="text-[#b5bac1]"
        >
          <SettingsIcon className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-[#2b2d31]">
            <CardContent className="text-center py-8">
              <Avatar className="w-24 h-24 mx-auto mb-4" size="lg">
                <AvatarImage src={server.icon} />
                <AvatarFallback>{server.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold text-white mb-2">{server.name}</h2>
              {server.description && (
                <p className="text-[#b5bac1] mb-4">{server.description}</p>
              )}
              <div className="flex justify-center gap-4 text-sm text-[#949ba4]">
                <span className="flex items-center gap-1">
                  <UsersIcon className="w-4 h-4" />
                  {members.length} members
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="my-6 h-px bg-[#3f4147]" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-[#2b2d31]">
              <CardContent>
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <HashIcon className="w-4 h-4" />
                  Text Channels
                </h3>
                <div className="space-y-2">
                  {textChannels.length > 0 ? (
                    textChannels.map((channel) => (
                      <Button
                        key={channel._id}
                        className="w-full justify-start text-[#b5bac1] hover:bg-[#35373c] hover:text-white"
                        onPress={() => handleChannelClick(channel)}
                      >
                        <HashIcon className="w-4 h-4 mr-2" />
                        {channel.name}
                      </Button>
                    ))
                  ) : (
                    <p className="text-sm text-[#949ba4]">No text channels</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Channel
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-[#2b2d31]">
              <CardContent>
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <UsersIcon className="w-4 h-4" />
                  Voice Channels
                </h3>
                <div className="space-y-2">
                  {voiceChannels.length > 0 ? (
                    voiceChannels.map((channel) => (
                      <Button
                        key={channel._id}
                        className="w-full justify-start text-[#b5bac1] hover:bg-[#35373c] hover:text-white"
                        onPress={() => handleChannelClick(channel)}
                      >
                        <UsersIcon className="w-4 h-4 mr-2" />
                        {channel.name}
                      </Button>
                    ))
                  ) : (
                    <p className="text-sm text-[#949ba4]">No voice channels</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Channel
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
