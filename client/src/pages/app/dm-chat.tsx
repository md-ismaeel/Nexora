import { useRef, useEffect, useMemo, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import { UserAvatar } from "@/components/custom/user-avatar"
import { MessageInput } from "@/components/features/chat/message-input"
import { MessageList, type ChatMessage } from "@/components/features/chat/message-list"
import { TypingIndicator } from "@/components/features/chat/typing-indicator"
import { useGetDmHistoryQuery, useSendDmMutation } from "@/api/dm_api"
import {
  Phone as PhoneIcon,
  Video as VideoIcon,
  Settings as SettingsIcon,
  ArrowLeft as ArrowLeftIcon,
} from "@/utils/lucide"
import type { PopulatedUser } from "@/types/message.types"
import type { IDirectMessage } from "@/types/message.types"
import type { UserStatus } from "@/components/custom/user-avatar"

export default function DMChatPage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingUsers = [] as PopulatedUser[]

  const { user } = useSelector((state: RootState) => state.auth)

  const { data: dmData, isLoading } = useGetDmHistoryQuery(
    { userId: userId!, limit: 50 },
    { skip: !userId }
  )

  const [sendDm, { isLoading: sending }] = useSendDmMutation()

  const messages = useMemo(() => (dmData?.data?.messages ?? []) as IDirectMessage[], [dmData])
  const otherUser = dmData?.data?.otherUser

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const convertToChatMessage = useCallback((dm: IDirectMessage): ChatMessage => {
    const author = typeof dm.sender === 'object' ? dm.sender :
      (dm.sender === user?._id ?
        { _id: user?._id || '', name: user?.name || 'Me', avatar: user?.avatar } :
        { _id: otherUser?._id || '', name: otherUser?.username || 'User', avatar: otherUser?.avatar })

    return {
      _id: dm._id,
      content: dm.content,
      author: author as PopulatedUser,
      createdAt: dm.createdAt,
      isEdited: dm.isEdited,
    }
  }, [user, otherUser])

  const chatMessages = useMemo(() => messages.map(convertToChatMessage), [messages, convertToChatMessage])

  const handleSend = async (content: string) => {
    if (!userId) return

    try {
      await sendDm({ receiverId: userId, content }).unwrap()
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  if (!userId) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#313338]">
        <p className="text-[#949ba4]">Select a conversation</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#313338]">
        <p className="text-[#949ba4]">Loading messages...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex h-12 items-center justify-between border-b border-[#1f2023] bg-[#313338] px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/channels/me")}
            className="rounded p-2 hover:bg-[#4e5058]"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          {otherUser && (
            <>
              <UserAvatar
                name={otherUser.username}
                avatar={otherUser.avatar}
                status={otherUser.status as UserStatus}
                size="sm"
              />
              <div>
                <h1 className="font-semibold text-white">{otherUser.username}</h1>
                <span className="text-xs text-[#949ba4]">
                  {otherUser.status === "online" ? "Online" : "Offline"}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button className="rounded p-2 text-[#b5bac1] hover:bg-[#4e5058]">
            <PhoneIcon className="h-5 w-5" />
          </button>
          <button className="rounded p-2 text-[#b5bac1] hover:bg-[#4e5058]">
            <VideoIcon className="h-5 w-5" />
          </button>
          <button className="rounded p-2 text-[#b5bac1] hover:bg-[#4e5058]">
            <SettingsIcon className="h-5 w-5" />
          </button>
        </div>
      </header>

      <MessageList
        messages={chatMessages}
        currentUserId={user?._id}
        className="flex-1"
      />

      {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}

      <MessageInput onSend={handleSend} isSending={sending} />
    </div>
  )
}
