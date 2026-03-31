import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tooltip, Button, Separator } from "@heroui/react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { MessageInput } from "@/components/features/chat/message-input";
import { MessageList, type ChatMessage } from "@/components/features/chat/message-list";
import { TypingIndicator } from "@/components/features/chat/typing-indicator";
import {
  HashIcon,
  PinIcon,
  UsersIcon,
  SearchIcon,
  BellIcon,
  HelpCircleIcon,
} from "@/utils/lucide";
import type { IServer, IChannel } from "@/types/server.types";

const mockChannelMessages: ChatMessage[] = [
  {
    _id: "1",
    content: "Welcome to the server!",
    author: { _id: "admin", name: "Server Admin", avatar: undefined },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: "2",
    content: "Feel free to chat in this channel",
    author: { _id: "mod", name: "Moderator", avatar: undefined },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: "3",
    content: "Hey everyone!",
    author: { _id: "user1", name: "John Doe", avatar: undefined },
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    _id: "4",
    content: "What's up?",
    author: { _id: "user2", name: "Jane Smith", avatar: undefined },
    createdAt: new Date(Date.now() - 900000).toISOString(),
  },
];

export default function ChannelPage() {
  const { serverId, channelId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(mockChannelMessages);
  const [isTyping, setIsTyping] = useState(false);

  const servers = useSelector((state: RootState) => state.server.servers);
  const server = servers.find((s) => s._id === serverId) as IServer | undefined;
  const channel = server?.channels?.find((c: any) => c._id === channelId) as IChannel | undefined;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (content: string) => {
    const newMessage: ChatMessage = {
      _id: Date.now().toString(),
      content,
      author: { _id: "me", name: "Me", avatar: undefined },
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  if (!server || !channel) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#313338]">
        <p className="text-[#949ba4]">Channel not found</p>
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
              <Separator orientation="vertical" className="h-6 mx-2 bg-[#3f4147]" />
              <span className="text-sm text-[#949ba4] truncate">{channel.topic}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Tooltip content="Pinned Messages">
            <button className="p-2 rounded hover:bg-[#4e5058] text-[#b5bac1]">
              <PinIcon className="w-5 h-5" />
            </button>
          </Tooltip>
          <Tooltip content="Members">
            <button className="p-2 rounded hover:bg-[#4e5058] text-[#b5bac1]">
              <UsersIcon className="w-5 h-5" />
            </button>
          </Tooltip>
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="w-36 h-7 px-2 rounded bg-[#1e1f22] text-sm text-[#dbdee1] placeholder-[#949ba4] border border-transparent focus:border-[#5865f2] outline-none"
            />
            <SearchIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#949ba4]" />
          </div>
          <Tooltip content="Notifications">
            <button className="p-2 rounded hover:bg-[#4e5058] text-[#b5bac1]">
              <BellIcon className="w-5 h-5" />
            </button>
          </Tooltip>
          <Tooltip content="Help">
            <button className="p-2 rounded hover:bg-[#4e5058] text-[#b5bac1]">
              <HelpCircleIcon className="w-5 h-5" />
            </button>
          </Tooltip>
        </div>
      </header>

      <MessageList messages={messages} className="flex-1" />

      <MessageInput onSend={handleSend} channelName={channel.name} />
    </div>
  );
}
