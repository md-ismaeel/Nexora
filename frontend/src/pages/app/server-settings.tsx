import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useGetServerByIdQuery,
  useUpdateServerMutation,
  useDeleteServerMutation,
  useGetServerMembersQuery,
  useBanMemberMutation,
  useGetServerBansQuery,
} from "@/api/server_api";
import { useGetServerRolesQuery } from "@/api/role_api";
import {
  useCreateChannelMutation,
  useDeleteChannelMutation,
  useGetChannelsQuery,
} from "@/api/channel_api";
import { useCreateCategoryMutation } from "@/api/category_api";
import { UserAvatar } from "@/components/custom/user-avatar";
import {
  Shield as ShieldIcon,
  Users as UsersIcon,
  Hash as HashIcon,
  Volume2 as VolumeIcon,
  Plus as PlusIcon,
  Trash2 as TrashIcon,
  Pencil as EditIcon,
  Copy as CopyIcon,
  Check as CheckIcon,
  Folder as FolderIcon,
  MoreVertical as MoreVerticalIcon,
  Gavel as GavelIcon,
  Loader2,
} from "@/utils/lucide";
import type { IServerMember } from "@/types/server.types";

interface BanRecord {
  user: { _id: string; username: string; avatar?: string };
  bannedBy: string;
  reason: string;
  bannedAt: string;
}

export default function ServerSettingsPage() {
  const { serverId } = useParams();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<IServerMember | null>(null);
  const [banReason, setBanReason] = useState("");
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelType, setNewChannelType] = useState<"text" | "voice">("text");
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [serverName, setServerName] = useState("");
  const [serverDescription, setServerDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const { data: serverData, isLoading: serverLoading } = useGetServerByIdQuery(serverId || "", {
    skip: !serverId,
  });
  const { data: membersData, isLoading: membersLoading } = useGetServerMembersQuery(serverId || "", {
    skip: !serverId,
  });
  const { data: rolesData, isLoading: rolesLoading } = useGetServerRolesQuery(serverId || "", {
    skip: !serverId,
  });
  const { data: bansData } = useGetServerBansQuery(serverId || "", {
    skip: !serverId,
  });
  const { data: channelsData } = useGetChannelsQuery(serverId || "", {
    skip: !serverId,
  });

  const [updateServer] = useUpdateServerMutation();
  const [deleteServer] = useDeleteServerMutation();
  const [banMember] = useBanMemberMutation();
  const [createChannel] = useCreateChannelMutation();
  const [deleteChannel] = useDeleteChannelMutation();
  const [createCategory] = useCreateCategoryMutation();

  const currentServer = serverData?.data;
  const members = (membersData?.data ?? []) as IServerMember[];
  const roles = rolesData?.data ?? [];
  const bans = (bansData?.data ?? []) as BanRecord[];
  const serverChannels = channelsData?.data ?? [];

  useEffect(() => {
    if (currentServer) {
      setServerName(currentServer.name);
      setServerDescription(currentServer.description || "");
      setIsPublic(currentServer.isPublic);
    }
  }, [currentServer]);

  if (serverLoading || !serverId) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#313338]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!currentServer) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#313338]">
        <p className="text-[#949ba4]">Server not found</p>
      </div>
    );
  }

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(`https://discord.gg/${inviteCode || "abc123"}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveServer = async () => {
    try {
      await updateServer({
        id: serverId!,
        name: serverName || currentServer.name,
        description: serverDescription,
        isPublic,
      });
    } catch (error) {
      console.error("Failed to update server:", error);
    }
  };

  const handleDeleteServer = async () => {
    try {
      await deleteServer(serverId!).unwrap();
      navigate("/channels/@me");
    } catch (error) {
      console.error("Failed to delete server:", error);
    }
  };

  const handleBanMember = async () => {
    if (!selectedMember) return;
    try {
      const userId = typeof selectedMember.user === "string" 
        ? selectedMember.user 
        : (selectedMember.user as { _id?: string })._id || "";
      await banMember({
        serverId: serverId!,
        memberId: userId,
        reason: banReason,
      }).unwrap();
      setShowBanModal(false);
      setSelectedMember(null);
      setBanReason("");
    } catch (error) {
      console.error("Failed to ban member:", error);
    }
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;
    try {
      await createChannel({
        serverId: serverId!,
        name: newChannelName,
        type: newChannelType,
      }).unwrap();
      setNewChannelName("");
      setShowChannelModal(false);
    } catch (error) {
      console.error("Failed to create channel:", error);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await createCategory({
        serverId: serverId!,
        name: newCategoryName,
      }).unwrap();
      setNewCategoryName("");
      setShowCategoryModal(false);
    } catch (error) {
      console.error("Failed to create category:", error);
    }
  };

  const textChannels = serverChannels.filter((c: { type: string }) => c.type === "text");
  const voiceChannels = serverChannels.filter((c: { type: string }) => c.type === "voice");

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#313338]">
      <div className="flex items-center justify-between px-4 h-12 border-b border-[#1f2023]">
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-white">{currentServer.name} Settings</h1>
        </div>
        <Button variant="default" onClick={() => navigate(`/servers/${serverId}`)}>
          Back to Channel
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
          >
            <TabsList className="bg-[#1e1f22] w-full justify-start">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#5865f2] data-[state=active]:text-white">Overview</TabsTrigger>
              <TabsTrigger value="channels" className="data-[state=active]:bg-[#5865f2] data-[state=active]:text-white">Channels</TabsTrigger>
              <TabsTrigger value="roles" className="data-[state=active]:bg-[#5865f2] data-[state=active]:text-white">Roles</TabsTrigger>
              <TabsTrigger value="members" className="data-[state=active]:bg-[#5865f2] data-[state=active]:text-white">Members</TabsTrigger>
            </TabsList>

            <div className="mt-4">
              {selectedTab === "overview" && (
                <Card className="bg-[#2b2d31] border-[#1f2023]">
                  <CardContent className="flex flex-col gap-6 pt-6">
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 rounded-full bg-[#5865f2] flex items-center justify-center text-2xl text-white overflow-hidden">
                        {currentServer.icon ? (
                          <AvatarImage src={currentServer.icon} alt={currentServer.name} className="w-full h-full object-cover" />
                        ) : (
                          <AvatarFallback>{currentServer.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{currentServer.name}</h3>
                        <p className="text-sm text-[#949ba4]">Server ID: {currentServer._id}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-[#949ba4] mb-1 block">Server Name</label>
                        <Input value={serverName} onChange={(e) => setServerName(e.target.value)} className="bg-[#1e1f22] border-[#3f4147] text-white" />
                      </div>
                      <div>
                        <label className="text-sm text-[#949ba4] mb-1 block">Description</label>
                        <Textarea value={serverDescription} onChange={(e) => setServerDescription(e.target.value)} className="bg-[#1e1f22] border-[#3f4147] text-white" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">Public Server</p>
                        <p className="text-xs text-[#949ba4]">Allow anyone to discover and join this server</p>
                      </div>
                      <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-white">Invite Link</h4>
                      <div className="flex gap-2">
                        <Input
                          placeholder="abc123"
                          value={inviteCode}
                          onChange={(e) => setInviteCode(e.target.value)}
                          className="bg-[#1e1f22] border-[#3f4147] text-white"
                        />
                        <Button variant="default" onClick={handleCopyInvite}>
                          {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                          {copied ? "Copied!" : "Copy"}
                        </Button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#3f4147]">
                      <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
                        Delete Server
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedTab === "channels" && (
                <div className="space-y-6">
                  <Card className="bg-[#2b2d31] border-[#1f2023]">
                    <CardContent>
                      <div className="flex justify-between items-center mb-4 pt-6">
                        <h4 className="font-semibold text-white flex items-center gap-2">
                          <FolderIcon className="w-4 h-4" /> Categories
                        </h4>
                        <Button size="sm" variant="default" onClick={() => setShowCategoryModal(true)}>
                          <PlusIcon className="w-4 h-4" />
                          Add Category
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 rounded bg-[#1e1f22]">
                          <span className="text-[#dbdee1]">Uncategorized</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#2b2d31] border-[#1f2023]">
                    <CardContent>
                      <div className="flex justify-between items-center mb-4 pt-6">
                        <h4 className="font-semibold text-white flex items-center gap-2">
                          <HashIcon className="w-4 h-4" /> Text Channels
                        </h4>
                        <Button size="sm" variant="default" onClick={() => { setNewChannelType("text"); setShowChannelModal(true); }}>
                          <PlusIcon className="w-4 h-4" />
                          Add Channel
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {textChannels.map((channel) => (
                          <div key={channel._id} className="flex items-center justify-between p-3 rounded bg-[#1e1f22]">
                            <span className="text-[#dbdee1]"># {channel.name}</span>
                            <Button size="sm" variant="ghost" className="text-[#ed4245]" onClick={() => deleteChannel(channel._id)}>
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        {textChannels.length === 0 && <p className="text-sm text-[#949ba4]">No text channels yet</p>}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#2b2d31] border-[#1f2023]">
                    <CardContent>
                      <div className="flex justify-between items-center mb-4 pt-6">
                        <h4 className="font-semibold text-white flex items-center gap-2">
                          <VolumeIcon className="w-4 h-4" /> Voice Channels
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {voiceChannels.map((channel) => (
                          <div key={channel._id} className="flex items-center justify-between p-3 rounded bg-[#1e1f22]">
                            <span className="text-[#dbdee1]">🔊 {channel.name}</span>
                            <Button size="sm" variant="ghost" className="text-[#ed4245]" onClick={() => deleteChannel(channel._id)}>
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        {voiceChannels.length === 0 && <p className="text-sm text-[#949ba4]">No voice channels yet</p>}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {selectedTab === "roles" && (
                <Card className="bg-[#2b2d31] border-[#1f2023]">
                  <CardContent>
                    <div className="flex justify-between items-center mb-4 pt-6">
                      <h4 className="font-semibold text-white flex items-center gap-2">
                        <ShieldIcon className="w-4 h-4" /> Roles
                      </h4>
                      <Button size="sm" variant="default">
                        <PlusIcon className="w-4 h-4" />
                        Create Role
                      </Button>
                    </div>
                    {rolesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                      <div className="space-y-2">
                        {roles.map((role) => (
                          <div key={role._id} className="flex items-center justify-between p-3 rounded bg-[#1e1f22]">
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: role.color }} />
                              <span className="text-[#dbdee1]">{role.name}</span>
                              {role.isDefault && <span className="text-xs bg-[#5865f2] px-2 py-0.5 rounded text-white">Default</span>}
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost"><EditIcon className="w-4 h-4" /></Button>
                              {!role.isDefault && <Button size="sm" variant="ghost" className="text-[#ed4245]"><TrashIcon className="w-4 h-4" /></Button>}
                            </div>
                          </div>
                        ))}
                        {roles.length === 0 && <p className="text-sm text-[#949ba4]">No custom roles yet</p>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {selectedTab === "members" && (
                <div className="space-y-4">
                  <Card className="bg-[#2b2d31] border-[#1f2023]">
                    <CardContent>
                      <div className="flex justify-between items-center mb-4 pt-6">
                        <h4 className="font-semibold text-white flex items-center gap-2">
                          <UsersIcon className="w-4 h-4" /> Members ({members.length})
                        </h4>
                      </div>
                      {membersLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                          {members.map((member) => {
                            const user = typeof member.user === "string" 
                              ? { _id: member.user, username: "Unknown", name: "Unknown User" }
                              : member.user as { _id?: string; username?: string; avatar?: string; name?: string };
                            return (
                              <div key={member._id} className="flex items-center justify-between p-3 rounded bg-[#1e1f22]">
                                <div className="flex items-center gap-3">
                                  <UserAvatar name={user.name || user.username || "User"} avatar={user.avatar} size="sm" />
                                  <div>
                                    <p className="text-[#dbdee1] font-medium">{user.username || user.name || "Unknown User"}</p>
                                    <p className="text-xs text-[#949ba4] capitalize">{member.role}</p>
                                  </div>
                                </div>
                                {member.role !== "owner" && (
                                  <Button size="sm" variant="ghost" onClick={() => { setSelectedMember(member); setShowBanModal(true); }}>
                                    <MoreVerticalIcon className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                          {members.length === 0 && <p className="text-sm text-[#949ba4]">No members found</p>}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {bans.length > 0 && (
                    <Card className="bg-[#2b2d31] border-[#1f2023]">
                      <CardContent>
                        <h4 className="font-semibold text-white flex items-center gap-2 mb-4 pt-6">
                          <GavelIcon className="w-4 h-4" /> Banned Members ({bans.length})
                        </h4>
                        <div className="space-y-2">
                          {bans.map((ban, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded bg-[#1e1f22]">
                              <div>
                                <p className="text-[#dbdee1]">{ban.user?.username || "Unknown"}</p>
                                <p className="text-xs text-[#949ba4]">{ban.reason || "No reason provided"}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </Tabs>
        </div>
      </div>

      <div className="flex justify-end gap-2 p-4 border-t border-[#1f2023]">
        <Button variant="ghost" onClick={() => navigate(`/servers/${serverId}`)}>Cancel</Button>
        <Button variant="default" onClick={handleSaveServer}>Save Changes</Button>
      </div>

      {/* Delete Server Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-[#2b2d31] text-white">
          <DialogHeader>
            <DialogTitle>Delete Server</DialogTitle>
          </DialogHeader>
          <p className="text-[#949ba4] mb-4">Are you sure you want to delete "{currentServer.name}"? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteServer}>Delete Server</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban Member Modal */}
      <Dialog open={showBanModal} onOpenChange={setShowBanModal}>
        <DialogContent className="bg-[#2b2d31] text-white">
          <DialogHeader>
            <DialogTitle>Ban Member</DialogTitle>
          </DialogHeader>
          <p className="text-[#949ba4] mb-4">Are you sure you want to ban this member? They will not be able to rejoin.</p>
          <div>
            <label className="text-sm text-[#949ba4] mb-1 block">Reason (optional)</label>
            <Textarea value={banReason} onChange={(e) => setBanReason(e.target.value)} className="bg-[#1e1f22] border-[#3f4147] text-white" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowBanModal(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleBanMember}>Ban Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Channel Modal */}
      <Dialog open={showChannelModal} onOpenChange={setShowChannelModal}>
        <DialogContent className="bg-[#2b2d31] text-white">
          <DialogHeader>
            <DialogTitle>Create Channel</DialogTitle>
          </DialogHeader>
          <div>
            <label className="text-sm text-[#949ba4] mb-1 block">Channel Name</label>
            <Input value={newChannelName} onChange={(e) => setNewChannelName(e.target.value)} className="bg-[#1e1f22] border-[#3f4147] text-white" />
          </div>
          <div className="mt-4">
            <label className="text-sm text-[#949ba4] mb-1 block">Channel Type</label>
            <div className="flex gap-2">
              <Button
                variant={newChannelType === "text" ? "default" : "secondary"}
                size="sm"
                onClick={() => setNewChannelType("text")}
              >
                Text Channel
              </Button>
              <Button
                variant={newChannelType === "voice" ? "default" : "secondary"}
                size="sm"
                onClick={() => setNewChannelType("voice")}
              >
                Voice Channel
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowChannelModal(false)}>Cancel</Button>
            <Button variant="default" onClick={handleCreateChannel}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Category Modal */}
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent className="bg-[#2b2d31] text-white">
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
          </DialogHeader>
          <div>
            <label className="text-sm text-[#949ba4] mb-1 block">Category Name</label>
            <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="bg-[#1e1f22] border-[#3f4147] text-white" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCategoryModal(false)}>Cancel</Button>
            <Button variant="default" onClick={handleCreateCategory}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
