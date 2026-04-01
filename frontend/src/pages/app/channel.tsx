import { useRef, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Tooltip, Spinner } from "@heroui/react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { MessageInput } from "@/components/features/chat/message-input";
import { MessageList, type ChatMessage } from "@/components/features/chat/message-list";
import { useGetMessagesQuery, useSendMessageMutation } from "@/api/message_api";
import { useGetServerByIdQuery } from "@/api/server_api";
import { useGetChannelsQuery } from "@/api/channel_api";
import {
  HashIcon,
  PinIcon,
  UsersIcon,
  SearchIcon,
  BellIcon,
  HelpCircleIcon,
} from "@/utils/lucide";
import type { IServer, IChannel } from "@/types/server.types";
import type { IMessage, PopulatedUser } from "@/types/message.types";

export default function ChannelPage() {
  const { serverId, channelId } = useParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const servers = useSelector((state: RootState) => state.server.servers);
  const server = servers.find((s) => s._id === serverId) as IServer | undefined;

  const { data: channelData } = useGetChannelsQuery(serverId!, { skip: !serverId });
  const { data: serverData } = useGetServerByIdQuery(serverId!, { skip: !serverId });
  const { data: messagesData, isLoading: messagesLoading } = useGetMessagesQuery(
    { channelId: channelId!, limit: 50 },
    { skip: !channelId }
  );

  const [sendMessage, { isLoading: sending }] = useSendMessageMutation();

  const serverWithDetails = serverData?.data || server;
  const channels = (channelData?.data ?? []) as IChannel[];
  const channel = channels.find((c) => c._id === channelId);

  const messages = (messagesData?.data?.messages ?? []) as IMessage[];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const convertToChatMessage = (msg: IMessage): ChatMessage => {
    const author = typeof msg.author === 'object' ? msg.author :
      { _id: msg.author as string, name: 'User' };

    return {
      _id: msg._id,
      content: msg.content,
      author: author as PopulatedUser,
      createdAt: msg.createdAt,
      isEdited: msg.isEdited,
      attachments: msg.attachments,
      reactions: msg.reactions,
    };
  };

  const chatMessages = useMemo(() => messages.map(convertToChatMessage), [messages]);

  const handleSend = async (content: string) => {
    if (!channelId) return;

    try {
      await sendMessage({ channelId, content }).unwrap();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (!serverId || !channelId) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#313338]">
        <p className="text-[#949ba4]">Select a channel</p>
      </div>
    );
  }

  if (!serverWithDetails || !channel) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#313338]">
        <Spinner color="primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex items-center justify-between px-4 h-12 border-b border-[#1f2023] bg-[#313338]">
        <div className="flex items-center gap-2">
          <HashIcon className="w-5 h-5 text-[#80848e]" />
          <h1 className="font-semibold text-white">{channel.name}</h1>
          {channel.topic && (
            <>
              <div className="h-6 mx-2 w-px bg-[#3f4147]" />
              <span className="text-sm text-[#949ba4] truncate">{channel.topic}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Tooltip>
            <Tooltip.Trigger>
              <button className="p-2 rounded hover:bg-[#4e5058] text-[#b5bac1]">
                <PinIcon className="w-5 h-5" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Content>Pinned Messages</Tooltip.Content>
          </Tooltip>
          <Tooltip>
            <Tooltip.Trigger>
              <button className="p-2 rounded hover:bg-[#4e5058] text-[#b5bac1]">
                <UsersIcon className="w-5 h-5" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Content>Members</Tooltip.Content>
          </Tooltip>
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="w-36 h-7 px-2 rounded bg-[#1e1f22] text-sm text-[#dbdee1] placeholder-[#949ba4] border border-transparent focus:border-[#5865f2] outline-none"
            />
            <SearchIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#949ba4]" />
          </div>
          <Tooltip>
            <Tooltip.Trigger>
              <button className="p-2 rounded hover:bg-[#4e5058] text-[#b5bac1]">
                <BellIcon className="w-5 h-5" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Content>Notifications</Tooltip.Content>
          </Tooltip>
          <Tooltip>
            <Tooltip.Trigger>
              <button className="p-2 rounded hover:bg-[#4e5058] text-[#b5bac1]">
                <HelpCircleIcon className="w-5 h-5" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Content>Help</Tooltip.Content>
          </Tooltip>
        </div>
      </header>

      {messagesLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Spinner color="primary" />
        </div>
      ) : (
        <MessageList messages={chatMessages} className="flex-1" />
      )}

      <MessageInput onSend={handleSend} channelName={channel.name} isSending={sending} />
    </div>
  );
}
