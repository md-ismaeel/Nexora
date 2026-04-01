import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ListBox,
  Tabs,
  Tab,
  Input,
  Button,
  Tooltip,
  ScrollShadow,
} from "@heroui/react";

import { UserAvatar } from "@/components/custom/user-avatar";
import {
  SearchIcon,
  PlusIcon,
  MessageCircleIcon,
  HeartIcon,
} from "@/utils/lucide";

import {
  useGetFriendsQuery,
  useGetPendingRequestsQuery,
} from "@/api/friend_api";

import type { IUser } from "@/types/user.types";
import type { IFriendRequest } from "@/types/message.types";

export default function FriendsPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"all" | "pending" | "blocked">("all");

  const [search, setSearch] = useState("");

  const { data: friendsData, isLoading: friendsLoading } =
    useGetFriendsQuery();

  const { data: pendingData } = useGetPendingRequestsQuery();

  const friends = (friendsData?.data ?? []) as IUser[];
  const pendingRequests = (pendingData?.data ?? []) as IFriendRequest[];

  const filteredFriends = friends.filter(
    (f) =>
      f.username?.toLowerCase().includes(search.toLowerCase()) ||
      f.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* LEFT SIDEBAR */}
      <div className="w-60 flex flex-col border-r border-[#1f2023] bg-[#2b2d31]">
        {/* SEARCH */}
        <div className="p-3">
          <Input
            placeholder="Search Friends"
            startContent={
              <SearchIcon className="w-4 h-4 text-[#949ba4]" />
            }
            size="sm"
            variant="primary"
            classNames={{
              input: "bg-transparent",
              inputWrapper:
                "bg-[#1e1f22] hover:bg-[#35373c] group-hover:bg-[#35373c]",
            }}
            value={search}
            onValueChange={setSearch}
          />
        </div>

        {/* ✅ Tabs (FIXED) */}
        <Tabs
          aria-label="Friends tabs"
          selectedKey={activeTab}
          onSelectionChange={(key) =>
            setActiveTab(key as typeof activeTab)
          }
          classNames={{
            tabList: "bg-transparent gap-2 p-2",
            cursor: "bg-[#5865f2]",
            tab: "h-8 text-xs",
          }}
        >
          <Tab key="all">All ({friends.length})</Tab>
          <Tab key="pending">
            Pending ({pendingRequests.length})
          </Tab>
          <Tab key="blocked">Blocked</Tab>
        </Tabs>

        {/* CONTENT */}
        <ScrollShadow className="flex-1 overflow-y-auto">
          {/* ── ALL FRIENDS ── */}
          {activeTab === "all" && (
            <ListBox aria-label="Friends list">
              {friendsLoading ? (
                <div className="p-4 text-center text-[#949ba4]">
                  Loading friends...
                </div>
              ) : filteredFriends.length > 0 ? (
                filteredFriends.map((friend) => (
                  <ListBox.Item
                    key={friend._id}
                    onClick={() =>
                      navigate(`/channels/@me/${friend._id}`)
                    }
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
                    <span className="font-medium">
                      {friend.username || friend.name}
                    </span>
                  </ListBox.Item>
                ))
              ) : (
                <div className="p-4 text-center text-[#949ba4]">
                  No friends yet
                </div>
              )}
            </ListBox>
          )}

          {/* ── PENDING ── */}
          {activeTab === "pending" && (
            <ListBox aria-label="Pending requests">
              {pendingRequests.length > 0 ? (
                pendingRequests.map((request) => {
                  const sender =
                    typeof request.sender === "object"
                      ? request.sender
                      : null;

                  return (
                    <ListBox.Item
                      key={request._id}
                      className="mx-2 rounded"
                      startContent={
                        sender && (
                          <UserAvatar
                            name={sender.name}
                            avatar={sender.avatar}
                            status={sender.status}
                            size="sm"
                          />
                        )
                      }
                    >
                      <span className="font-medium">
                        {sender?.username ||
                          sender?.name ||
                          "Unknown"}
                      </span>
                    </ListBox.Item>
                  );
                })
              ) : (
                <div className="p-4 text-center text-[#949ba4]">
                  No pending friend requests
                </div>
              )}
            </ListBox>
          )}

          {/* ── BLOCKED ── */}
          {activeTab === "blocked" && (
            <div className="p-4 text-center text-[#949ba4]">
              No blocked users
            </div>
          )}
        </ScrollShadow>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#313338]">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#4e5058] flex items-center justify-center">
            <HeartIcon className="w-10 h-10 text-[#b5bac1]" />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">
            Friends
          </h2>

          <p className="text-[#b5bac1] mb-4">
            Send requests, chat 1:1, and more.
          </p>

          <Button
            color="primary"
            startContent={<PlusIcon className="w-4 h-4" />}
          >
            Add Friend
          </Button>
        </div>
      </div>
    </div>
  );
}