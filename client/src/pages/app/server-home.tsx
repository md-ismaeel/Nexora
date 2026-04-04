import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Hash as HashIcon, Users as UsersIcon, Settings as SettingsIcon, Plus as PlusIcon } from "@/utils/lucide"
import { useGetServerByIdQuery, useGetServerMembersQuery } from "@/api/server_api"
import { useGetChannelsQuery } from "@/api/channel_api"
import { useAppDispatch } from "@/store/hooks"
import { openModal } from "@/store/slices/ui_slice"
import type { IChannel } from "@/types/server.types"

export default function ServerHomePage() {
  const { serverId } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { data: serverData, isLoading: serverLoading } = useGetServerByIdQuery(serverId!, { skip: !serverId })
  const { data: channelsData } = useGetChannelsQuery(serverId!, { skip: !serverId })
  const { data: membersData } = useGetServerMembersQuery(serverId!, { skip: !serverId })

  const server = serverData?.data
  const channels = (channelsData?.data ?? []) as IChannel[]
  const members = membersData?.data ?? []

  if (serverLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#313338]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5865f2] border-t-transparent" />
      </div>
    )
  }

  if (!server) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#313338]">
        <Card className="w-96 bg-[#2b2d31] border-[#1e1f22]">
          <CardContent className="py-8 text-center">
            <p className="text-[#949ba4]">Server not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleChannelClick = (channel: IChannel) => {
    navigate(`/servers/${serverId}/${channel._id}`)
  }

  const handleSettingsClick = () => {
    navigate(`/servers/${serverId}/settings`)
  }

  const handleCreateChannel = () => {
    dispatch(openModal({ modal: "createChannel", data: { serverId } }))
  }

  const textChannels = channels.filter((c) => c.type === "text")
  const voiceChannels = channels.filter((c) => c.type === "voice")

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#313338]">
      <div className="flex h-12 items-center justify-between border-b border-[#1f2023] px-4">
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-white">{server.name}</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSettingsClick}
          className="text-[#b5bac1]"
        >
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl">
          <Card className="bg-[#2b2d31] border-[#1e1f22]">
            <CardContent className="py-8 text-center">
              <Avatar className="mx-auto mb-4 h-24 w-24">
                <AvatarImage src={server.icon} />
                <AvatarFallback className="bg-[#5865f2] text-white">{server.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <h2 className="mb-2 text-2xl font-bold text-white">{server.name}</h2>
              {server.description && (
                <p className="mb-4 text-[#b5bac1]">{server.description}</p>
              )}
              <div className="flex justify-center gap-4 text-sm text-[#949ba4]">
                <span className="flex items-center gap-1">
                  <UsersIcon className="h-4 w-4" />
                  {members.length} members
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="my-6 h-px bg-[#3f4147]" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="bg-[#2b2d31] border-[#1e1f22]">
              <CardHeader>
                <h3 className="flex items-center gap-2 font-semibold text-white">
                  <HashIcon className="h-4 w-4" />
                  Text Channels
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {textChannels.length > 0 ? (
                    textChannels.map((channel) => (
                      <Button
                        key={channel._id}
                        variant="ghost"
                        className="w-full justify-start text-[#b5bac1] hover:bg-[#35373c] hover:text-white"
                        onClick={() => handleChannelClick(channel)}
                      >
                        <HashIcon className="mr-2 h-4 w-4" />
                        {channel.name}
                      </Button>
                    ))
                  ) : (
                    <p className="text-sm text-[#949ba4]">No text channels</p>
                  )}
                </div>
              </CardContent>
              <CardHeader>
                <Button variant="ghost" size="sm" onClick={handleCreateChannel}>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Create Channel
                </Button>
              </CardHeader>
            </Card>

            <Card className="bg-[#2b2d31] border-[#1e1f22]">
              <CardHeader>
                <h3 className="flex items-center gap-2 font-semibold text-white">
                  <UsersIcon className="h-4 w-4" />
                  Voice Channels
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {voiceChannels.length > 0 ? (
                    voiceChannels.map((channel) => (
                      <Button
                        key={channel._id}
                        variant="ghost"
                        className="w-full justify-start text-[#b5bac1] hover:bg-[#35373c] hover:text-white"
                        onClick={() => handleChannelClick(channel)}
                      >
                        <UsersIcon className="mr-2 h-4 w-4" />
                        {channel.name}
                      </Button>
                    ))
                  ) : (
                    <p className="text-sm text-[#949ba4]">No voice channels</p>
                  )}
                </div>
              </CardContent>
              <CardHeader>
                <Button variant="ghost" size="sm" onClick={handleCreateChannel}>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Create Channel
                </Button>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
