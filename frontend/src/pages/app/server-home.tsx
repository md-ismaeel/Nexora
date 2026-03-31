import { useParams, useNavigate } from "react-router-dom";
import { Card, Avatar, Button, Separator } from "@heroui/react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { HashIcon, UsersIcon, SettingsIcon, PlusIcon } from "@/utils/lucide";
import type { IServer, IChannel } from "@/types/server.types";

export default function ServerHomePage() {
  const { serverId } = useParams();
  const navigate = useNavigate();
  const servers = useSelector((state: RootState) => state.server.servers);
  const server = servers.find((s) => s._id === serverId) as IServer | undefined;

  if (!server) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#313338]">
        <Card className="w-96">
          <Card.Content className="text-center py-8">
            <p className="text-[#949ba4]">Server not found</p>
          </Card.Content>
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

  const textChannels = server.channels?.filter((c: any) => c.type === "text") || [];
  const voiceChannels = server.channels?.filter((c: any) => c.type === "voice") || [];

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#313338]">
      <div className="flex items-center justify-between px-4 h-12 border-b border-[#1f2023]">
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-white">{server.name}</h1>
        </div>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={handleSettingsClick}
          className="text-[#b5bac1]"
        >
          <SettingsIcon className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-[#2b2d31]">
            <Card.Content className="text-center py-8">
              <Avatar
                src={server.icon}
                name={server.name}
                className="w-24 h-24 mx-auto mb-4"
                size="lg"
              />
              <h2 className="text-2xl font-bold text-white mb-2">{server.name}</h2>
              {server.description && (
                <p className="text-[#b5bac1] mb-4">{server.description}</p>
              )}
              <div className="flex justify-center gap-4 text-sm text-[#949ba4]">
                <span className="flex items-center gap-1">
                  <UsersIcon className="w-4 h-4" />
                  {server.members?.length || 0} members
                </span>
              </div>
            </Card.Content>
          </Card>

          <Separator className="my-6 bg-[#3f4147]" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-[#2b2d31]">
              <Card.Content>
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <HashIcon className="w-4 h-4" />
                  Text Channels
                </h3>
                <div className="space-y-2">
                  {textChannels.length > 0 ? (
                    textChannels.map((channel: any) => (
                      <Button
                        key={channel._id}
                        variant="flat"
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
              </Card.Content>
              <Card.Footer>
                <Button variant="light" size="sm" startContent={<PlusIcon className="w-4 h-4" />}>
                  Create Channel
                </Button>
              </Card.Footer>
            </Card>

            <Card className="bg-[#2b2d31]">
              <Card.Content>
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <UsersIcon className="w-4 h-4" />
                  Voice Channels
                </h3>
                <div className="space-y-2">
                  {voiceChannels.length > 0 ? (
                    voiceChannels.map((channel: any) => (
                      <Button
                        key={channel._id}
                        variant="flat"
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
              </Card.Content>
              <Card.Footer>
                <Button variant="light" size="sm" startContent={<PlusIcon className="w-4 h-4" />}>
                  Create Channel
                </Button>
              </Card.Footer>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
