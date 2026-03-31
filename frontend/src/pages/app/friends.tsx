import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Badge, Listbox, ListboxItem, Tabs, Tab, Input, Button, AvatarGroup, Tooltip } from "@heroui/react";
import { UserAvatar } from "@/components/custom/user-avatar";
import { ScrollShadow } from "@heroui/react";
import {
  SearchIcon,
  PlusIcon,
  PhoneIcon,
  VideoIcon,
  SettingsIcon,
  MessageCircleIcon,
  HeartIcon,
} from "@/utils/lucide";
import type { IUser } from "@/types/user.types";

interface FriendsPageProps {
  currentUser?: IUser;
}

export default function FriendsPage({ currentUser }: FriendsPageProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const friends: IUser[] = [];
  const pendingRequests: IUser[] = [];
  const blockedUsers: IUser[] = [];

  const allFriends = [
    { id: "1", name: "John Doe", status: "online" as const, avatar: undefined },
    { id: "2", name: "Jane Smith", status: "away" as const, avatar: undefined },
    { id: "3", name: "Bob Wilson", status: "dnd" as const, avatar: undefined },
  ];

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="w-60 flex flex-col border-r border-[#1f2023] bg-[#2b2d31]">
        <div className="p-3">
          <Input
            placeholder="Search Friends"
            startContent={<SearchIcon className="w-4 h-4 text-[#949ba4]" />}
            size="sm"
            variant="flat"
            classNames={{
              input: "bg-transparent",
              inputWrapper: "bg-[#1e1f22] hover:bg-[#35373c] group-hover:bg-[#35373c]",
            }}
            value={search}
            onValueChange={setSearch}
          />
        </div>

        <Tabs
          aria-label="Friends tabs"
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          classNames={{
            tabList: "bg-transparent gap-2 p-2",
            cursor: "bg-[#5865f2]",
            tab: "h-8 text-xs",
          }}
        >
          <Tab key="all" title="All" />
          <Tab key="pending" title="Pending" />
          <Tab key="blocked" title="Blocked" />
        </Tabs>

        <ScrollShadow className="flex-1 overflow-y-auto">
          {activeTab === "all" && (
            <Listbox aria-label="Friends list">
              {allFriends.map((friend) => (
                <ListboxItem
                  key={friend.id}
                  onClick={() => navigate(`/channels/@me/${friend.id}`)}
                  className="mx-2 rounded"
                  startContent={
                    <UserAvatar
                      name={friend.name}
                      avatar={friend.avatar}
                      status={friend.status}
                      size="sm"
                      showStatusTooltip
                    />
                  }
                  endContent={
                    <div className="flex gap-1">
                      <Tooltip content="Message">
                        <button className="p-1 rounded hover:bg-[#4e5058]">
                          <MessageCircleIcon className="w-4 h-4" />
                        </button>
                      </Tooltip>
                    </div>
                  }
                >
                  <span className="font-medium">{friend.name}</span>
                </ListboxItem>
              ))}
            </Listbox>
          )}

          {activeTab === "pending" && (
            <div className="p-4 text-center text-[#949ba4]">
              <p>No pending friend requests</p>
            </div>
          )}

          {activeTab === "blocked" && (
            <div className="p-4 text-center text-[#949ba4]">
              <p>No blocked users</p>
            </div>
          )}
        </ScrollShadow>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center bg-[#313338]">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#4e5058] flex items-center justify-center">
            <HeartIcon className="w-10 h-10 text-[#b5bac1]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Friends</h2>
          <p className="text-[#b5bac1] mb-4">Send requests, chat 1:1, and more.</p>
          <Button color="primary" startContent={<PlusIcon className="w-4 h-4" />}>
            Add Friend
          </Button>
        </div>
      </div>
    </div>
  );
}
