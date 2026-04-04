import { useRef, useEffect, useMemo, useCallback } from "react"
import { useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import { MessageInput } from "@/components/features/chat/message-input"
import { MessageList, type ChatMessage } from "@/components/features/chat/message-list"
import { useGetMessagesQuery, useSendMessageMutation } from "@/api/message_api"
import { useGetServerByIdQuery } from "@/api/server_api"
import { useGetChannelsQuery } from "@/api/channel_api"
import {
  HashIcon,
  PinIcon,
  UsersIcon,
  SearchIcon,
  BellIcon,
  HelpCircleIcon,
} from "@/utils/lucide"
import type { IServer, IChannel } from "@/types/server.types"
import type { IMessage, PopulatedUser } from "@/types/message.types"

export default function ChannelPage() {
  const { serverId, channelId } = useParams()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const servers = useSelector((state: RootState) => state.server.servers)
  const server = servers.find((s) => s._id === serverId) as IServer | undefined

  const { data: channelData } = useGetChannelsQuery(serverId!, { skip: !serverId })
  const { data: serverData } = useGetServerByIdQuery(serverId!, { skip: !serverId })
  const { data: messagesData, isLoading: messagesLoading } = useGetMessagesQuery(
    { channelId: channelId!, limit: 50 },
    { skip: !channelId }
  )

  const [sendMessage, { isLoading: sending }] = useSendMessageMutation()

  const serverWithDetails = serverData?.data || server
  const channels = (channelData?.data ?? []) as IChannel[]
  const channel = channels.find((c) => c._id === channelId)

  const messages = useMemo(() => (messagesData?.data?.messages ?? []) as IMessage[], [messagesData])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const convertToChatMessage = useCallback((msg: IMessage): ChatMessage => {
    const author = typeof msg.author === 'object' ? msg.author :
      { _id: msg.author as string, name: 'User' };

    return {
      _id: msg._id,
      content: msg.content,
      author: author as PopulatedUser,
      createdAt: msg.createdAt,
      isEdited: msg.isEdited,
      attachments: msg.attachments,
      reactions: msg.reactions.map(r => ({
        emoji: r.emoji,
        count: r.users.length,
        users: r.users,
      })),
    }
  }, [])

  const chatMessages = useMemo(() => messages.map(convertToChatMessage), [messages, convertToChatMessage])

  const handleSend = useCallback((content: string) => {
    if (!channelId) return
    sendMessage({ channelId, content })
  }, [channelId, sendMessage])

  if (!serverWithDetails || !channel) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#313338]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5865f2] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex h-12 items-center justify-between border-b border-[#1f2023] bg-[#313338] px-4">
        <div className="flex items-center gap-2">
          <HashIcon className="h-5 w-5 text-[#80848e]" />
          <h1 className="font-semibold text-white">{channel.name}</h1>
          {channel.topic && (
            <>
              <div className="mx-2 h-6 w-px bg-[#3f4147]" />
              <span className="truncate text-sm text-[#949ba4]">{channel.topic}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button className="rounded p-2 text-[#b5bac1] hover:bg-[#4e5058]">
            <PinIcon className="h-5 w-5" />
          </button>
          <button className="rounded p-2 text-[#b5bac1] hover:bg-[#4e5058]">
            <UsersIcon className="h-5 w-5" />
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="h-7 w-36 rounded border border-transparent bg-[#1e1f22] px-2 text-sm text-[#dbdee1] placeholder-[#949ba4] focus:border-[#5865f2] focus:outline-none"
            />
            <SearchIcon className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[#949ba4]" />
          </div>
          <button className="rounded p-2 text-[#b5bac1] hover:bg-[#4e5058]">
            <BellIcon className="h-5 w-5" />
          </button>
          <button className="rounded p-2 text-[#b5bac1] hover:bg-[#4e5058]">
            <HelpCircleIcon className="h-5 w-5" />
          </button>
        </div>
      </header>

      {messagesLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5865f2] border-t-transparent" />
        </div>
      ) : (
        <MessageList messages={chatMessages} className="flex-1" />
      )}

      <MessageInput onSend={handleSend} channelName={channel.name} isSending={sending} />
    </div>
  )
}
