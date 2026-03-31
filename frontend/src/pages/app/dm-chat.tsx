import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Avatar, Tooltip, Button } from "@heroui/react";
import { UserAvatar } from "@/components/custom/user-avatar";
import { MessageInput } from "@/components/features/chat/message-input";
import { MessageList, type ChatMessage } from "@/components/features/chat/message-list";
import { TypingIndicator } from "@/components/features/chat/typing-indicator";
import { ScrollShadow } from "@heroui/react";
import {
  PhoneIcon,
  VideoIcon,
  SettingsIcon,
  ArrowLeftIcon,
  UsersIcon,
} from "@/utils/lucide";
import type { IUser } from "@/types/user.types";
import type { PopulatedUser } from "@/types/message.types";

interface DMChatPageProps {
  currentUser?: IUser;
}

const mockMessages: ChatMessage[] = [
  {
    _id: "1",
    content: "Hey! How are you doing?",
    author: { _id: "other", name: "John Doe", avatar: undefined },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: "2",
    content: "I'm doing great, thanks for asking!",
    author: { _id: "me", name: "Me", avatar: undefined },
    createdAt: new Date(Date.now() - 3500000).toISOString(),
  },
  {
    _id: "3",
    content: "Did you see the new movie?",
    author: { _id: "other", name: "John Doe", avatar: undefined },
    createdAt: new Date(Date.now() - 3400000).toISOString(),
  },
];

const mockOtherUser: PopulatedUser = {
  _id: "other",
  name: "John Doe",
  username: "johndoe",
  avatar: undefined,
  status: "online",
};

export default function DMChatPage({ currentUser }: DMChatPageProps) {
  const { userId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<PopulatedUser[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (content: string) => {
    const newMessage: ChatMessage = {
      _id: Date.now().toString(),
      content,
      author: { _id: "me", name: currentUser?.name || "Me", avatar: currentUser?.avatar },
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);

    setTimeout(() => {
      setIsTyping(true);
      setTypingUsers([mockOtherUser]);
      setTimeout(() => {
        setIsTyping(false);
        setTypingUsers([]);
        const response: ChatMessage = {
          _id: (Date.now() + 1).toString(),
          content: "That's awesome!",
          author: mockOtherUser,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, response]);
      }, 2000);
    }, 1000);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex items-center justify-between px-4 h-12 border-b border-[#1f2023] bg-[#313338]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/channels/@me")}
            className="p-2 rounded hover:bg-[#4e5058]"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <UserAvatar
            name={mockOtherUser.name}
            avatar={mockOtherUser.avatar}
            status={mockOtherUser.status}
            size="sm"
            showStatusTooltip
          />
          <div>
            <h1 className="font-semibold text-white">{mockOtherUser.name}</h1>
            <span className="text-xs text-[#949ba4]">
              {mockOtherUser.status === "online" ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Tooltip content="Voice Call">
            <button className="p-2 rounded hover:bg-[#4e5058] text-[#b5bac1]">
              <PhoneIcon className="w-5 h-5" />
            </button>
          </Tooltip>
          <Tooltip content="Video Call">
            <button className="p-2 rounded hover:bg-[#4e5058] text-[#b5bac1]">
              <VideoIcon className="w-5 h-5" />
            </button>
          </Tooltip>
          <Tooltip content="User Settings">
            <button className="p-2 rounded hover:bg-[#4e5058] text-[#b5bac1]">
              <SettingsIcon className="w-5 h-5" />
            </button>
          </Tooltip>
        </div>
      </header>

      <MessageList
        messages={messages}
        currentUserId={currentUser?._id}
        className="flex-1"
      />

      {isTyping && <TypingIndicator users={typingUsers} />}

      <MessageInput onSend={handleSend} />
    </div>
  );
}
