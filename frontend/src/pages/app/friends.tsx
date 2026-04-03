import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAvatar } from "@/components/custom/user-avatar";
import {
  Plus as PlusIcon,
  Heart as HeartIcon,
  Check as CheckIcon,
  X as XIcon,
} from "@/utils/lucide";
import {
  useGetFriendsQuery,
  useGetPendingRequestsQuery,
  useAcceptFriendRequestMutation,
  useDeclineFriendRequestMutation,
} from "@/api/friend_api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { IUser } from "@/types/user.types";
import type { IFriendRequest } from "@/types/message.types";

export default function FriendsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "blocked">("all");
  const [search, setSearch] = useState("");

  const { data: friendsData, isLoading: friendsLoading } = useGetFriendsQuery();
  const { data: pendingData } = useGetPendingRequestsQuery();
  const [acceptRequest] = useAcceptFriendRequestMutation();
  const [declineRequest] = useDeclineFriendRequestMutation();

  const friends = (friendsData?.data ?? []) as IUser[];
  const pendingRequests = (pendingData?.data ?? []) as IFriendRequest[];

  const filteredFriends = friends.filter(
    (f) =>
      f.username?.toLowerCase().includes(search.toLowerCase()) ||
      f.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAccept = async (requestId: string) => {
    try {
      await acceptRequest(requestId).unwrap();
    } catch (error) {
      console.error("Failed to accept request:", error);
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await declineRequest(requestId).unwrap();
    } catch (error) {
      console.error("Failed to decline request:", error);
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="w-60 flex flex-col border-r border-[#1f2023] bg-[#2b2d31]">
        <div className="p-3">
          <Input
            type="text"
            placeholder="Search Friends"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#1e1f22] border-[#3f4147] text-[#dbdee1] placeholder-[#949ba4]"
          />
        </div>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as typeof activeTab)}>
          <TabsList className="bg-[#1e1f22] w-full justify-start p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#5865f2] data-[state=active]:text-white text-xs">
              All ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-[#5865f2] data-[state=active]:text-white text-xs">
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="blocked" className="data-[state=active]:bg-[#5865f2] data-[state=active]:text-white text-xs">
              Blocked
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-2">
            <TabsContent value="all" className="mt-0">
              {friendsLoading ? (
                <div className="p-4 text-center text-[#949ba4]">Loading friends...</div>
              ) : (
                <div className="space-y-1 px-2">
                  {filteredFriends.map((friend) => (
                    <div
                      key={friend._id}
                      onClick={() => navigate(`/channels/@me/${friend._id}`)}
                      className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-[#35373c]"
                    >
                      <UserAvatar
                        name={friend.name}
                        avatar={friend.avatar}
                        status={friend.status}
                        size="sm"
                        showStatusTooltip
                      />
                      <span className="font-medium text-[#dbdee1]">
                        {friend.username || friend.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending" className="mt-0">
              <div className="space-y-1 px-2">
                {pendingRequests.map((request) => {
                  const sender = typeof request.sender === "object" ? request.sender : null;
                  return (
                    <div key={request._id} className="flex items-center gap-3 p-2 rounded hover:bg-[#35373c]">
                      {sender && (
                        <UserAvatar
                          name={sender.name}
                          avatar={sender.avatar}
                          status={sender.status}
                          size="sm"
                        />
                      )}
                      <span className="font-medium flex-1 text-[#dbdee1]">
                        {sender?.username || sender?.name || "Unknown"}
                      </span>
                      <div className="flex gap-1">
                        <button
                          className="p-1 rounded hover:bg-green-500/20 text-green-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAccept(request._id);
                          }}
                          title="Accept"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 rounded hover:bg-red-500/20 text-red-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDecline(request._id);
                          }}
                          title="Decline"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="blocked" className="mt-0">
              <div className="p-4 text-center text-[#949ba4]">
                No blocked users
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

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
          <Button variant="default">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Friend
          </Button>
        </div>
      </div>
    </div>
  );
}
