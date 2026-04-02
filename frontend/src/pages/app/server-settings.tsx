import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  Button,
  TextField,
  Label,
  TextArea,
  Input,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Switch,
  Modal,
  ModalBackdrop,
  ModalContainer,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  Dropdown,
  DropdownTrigger,
  DropdownItem,
  Select,
  ListBox,
  ListBoxItem,
} from "@heroui/react";
import {
  useGetServerByIdQuery,
  useUpdateServerMutation,
  useDeleteServerMutation,
  useGetServerMembersQuery,
  useKickMemberMutation,
  useBanMemberMutation,
  useGetServerBansQuery,
} from "@/api/server_api";
import { useGetServerRolesQuery } from "@/api/role_api";
import {
  useCreateChannelMutation,
  useDeleteChannelMutation,
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
} from "@/utils/lucide";
import type { IChannel, IServerMember, IRole } from "@/types/server.types";

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

  const [updateServer] = useUpdateServerMutation();
  const [deleteServer] = useDeleteServerMutation();
  const [kickMember] = useKickMemberMutation();
  const [banMember] = useBanMemberMutation();
  const [createChannel] = useCreateChannelMutation();
  const [deleteChannel] = useDeleteChannelMutation();
  const [createCategory] = useCreateCategoryMutation();

  const currentServer = serverData?.data;
  const members = (membersData?.data ?? []) as IServerMember[];
  const roles = (rolesData?.data ?? []) as IRole[];
  const bans = (bansData?.data ?? []) as BanRecord[];

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
        <Spinner color="accent" />
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

  const handleKickMember = async (memberId: string) => {
    try {
      await kickMember({ serverId: serverId!, memberId }).unwrap();
    } catch (error) {
      console.error("Failed to kick member:", error);
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

  const channels = (currentServer.channels ?? []) as IChannel[];
  const textChannels = channels.filter((c) => c.type === "text");
  const voiceChannels = channels.filter((c) => c.type === "voice");

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#313338]">
      <div className="flex items-center justify-between px-4 h-12 border-b border-[#1f2023]">
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-white">{currentServer.name} Settings</h1>
        </div>
        <Button variant="primary" onPress={() => navigate(`/servers/${serverId}`)}>
          Back to Channel
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <Tabs
            aria-label="Server settings tabs"
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key as string)}
          >
            <Tab key="overview">Overview</Tab>
            <Tab key="channels">Channels</Tab>
            <Tab key="roles">Roles</Tab>
            <Tab key="members">Members</Tab>
          </Tabs>

          <div className="mt-4">
            {selectedTab === "overview" && (
              <Card className="bg-[#2b2d31]">
                <CardContent className="flex flex-col gap-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="w-24 h-24 rounded-full bg-[#5865f2]">
                      {currentServer.icon && <AvatarImage src={currentServer.icon} alt={currentServer.name} />}
                      <AvatarFallback>{currentServer.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold text-white">{currentServer.name}</h3>
                      <p className="text-sm text-[#949ba4]">Server ID: {currentServer._id}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <TextField>
                      <Label>Server Name</Label>
                      <Input value={serverName} onChange={(e) => setServerName(e.target.value)} />
                    </TextField>
                    <TextField>
                      <Label>Description</Label>
                      <TextArea value={serverDescription} onChange={(e) => setServerDescription(e.target.value)} />
                    </TextField>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Public Server</p>
                      <p className="text-xs text-[#949ba4]">Allow anyone to discover and join this server</p>
                    </div>
                    <Switch isSelected={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-white">Invite Link</h4>
                    <div className="flex gap-2">
                      <Input
                        placeholder="abc123"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                      />
                      <Button variant="primary" onPress={handleCopyInvite}>
                        {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#3f4147]">
                    <Button variant="danger" onPress={() => setShowDeleteModal(true)}>
                      Delete Server
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedTab === "channels" && (
              <div className="space-y-6">
                <Card className="bg-[#2b2d31]">
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-white flex items-center gap-2">
                        <FolderIcon className="w-4 h-4" /> Categories
                      </h4>
                      <Button size="sm" variant="primary" onPress={() => setShowCategoryModal(true)}>
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

                <Card className="bg-[#2b2d31]">
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-white flex items-center gap-2">
                        <HashIcon className="w-4 h-4" /> Text Channels
                      </h4>
                      <Button size="sm" variant="primary" onPress={() => { setNewChannelType("text"); setShowChannelModal(true); }}>
                        <PlusIcon className="w-4 h-4" />
                        Add Channel
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {textChannels.map((channel) => (
                        <div key={channel._id} className="flex items-center justify-between p-3 rounded bg-[#1e1f22]">
                          <span className="text-[#dbdee1]"># {channel.name}</span>
                          <Button isIconOnly size="sm" variant="ghost" className="text-[#ed4245]" onPress={() => deleteChannel(channel._id)}>
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      {textChannels.length === 0 && <p className="text-sm text-[#949ba4]">No text channels yet</p>}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#2b2d31]">
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-white flex items-center gap-2">
                        <VolumeIcon className="w-4 h-4" /> Voice Channels
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {voiceChannels.map((channel) => (
                        <div key={channel._id} className="flex items-center justify-between p-3 rounded bg-[#1e1f22]">
                          <span className="text-[#dbdee1]">🔊 {channel.name}</span>
                          <Button isIconOnly size="sm" variant="ghost" className="text-[#ed4245]" onPress={() => deleteChannel(channel._id)}>
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
              <Card className="bg-[#2b2d31]">
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-white flex items-center gap-2">
                      <ShieldIcon className="w-4 h-4" /> Roles
                    </h4>
                    <Button size="sm" variant="primary">
                      <PlusIcon className="w-4 h-4" />
                      Create Role
                    </Button>
                  </div>
                  {rolesLoading ? <Spinner size="sm" /> : (
                    <div className="space-y-2">
                      {roles.map((role) => (
                        <div key={role._id} className="flex items-center justify-between p-3 rounded bg-[#1e1f22]">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: role.color }} />
                            <span className="text-[#dbdee1]">{role.name}</span>
                            {role.isDefault && <Chip size="sm" variant="soft">Default</Chip>}
                          </div>
                          <div className="flex gap-1">
                            <Button isIconOnly size="sm" variant="ghost"><EditIcon className="w-4 h-4" /></Button>
                            {!role.isDefault && <Button isIconOnly size="sm" variant="ghost" className="text-[#ed4245]"><TrashIcon className="w-4 h-4" /></Button>}
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
                <Card className="bg-[#2b2d31]">
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-white flex items-center gap-2">
                        <UsersIcon className="w-4 h-4" /> Members ({members.length})
                      </h4>
                    </div>
                    {membersLoading ? <Spinner size="sm" /> : (
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
                                <Dropdown>
                                  <DropdownTrigger>
                                    <Button isIconOnly size="sm" variant="ghost"><MoreVerticalIcon className="w-4 h-4" /></Button>
                                  </DropdownTrigger>
                                  <DropdownItem key="ban" onPress={() => { setSelectedMember(member); setShowBanModal(true); }}>
                                    <span className="text-danger flex items-center"><GavelIcon className="w-4 h-4 mr-2" />Ban</span>
                                  </DropdownItem>
                                  <DropdownItem key="kick" onPress={() => handleKickMember(member._id)}>
                                    <span className="text-danger">Kick</span>
                                  </DropdownItem>
                                </Dropdown>
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
                  <Card className="bg-[#2b2d31]">
                    <CardContent>
                      <h4 className="font-semibold text-white flex items-center gap-2 mb-4">
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
        </div>
      </div>

      <div className="flex justify-end gap-2 p-4 border-t border-[#1f2023]">
        <Button variant="ghost" onPress={() => navigate(`/servers/${serverId}`)}>Cancel</Button>
        <Button color="primary" variant="primary" onPress={handleSaveServer}>Save Changes</Button>
      </div>

      {/* Delete Server Modal */}
      <Modal isOpen={showDeleteModal} onOpenChange={(open) => setShowDeleteModal(open)}>
        <ModalBackdrop />
        <ModalContainer>
          <ModalHeader>Delete Server</ModalHeader>
          <ModalBody>
            <p className="text-[#949ba4] mb-4">Are you sure you want to delete "{currentServer.name}"? This action cannot be undone.</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onPress={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button color="danger" variant="primary" onPress={handleDeleteServer}>Delete Server</Button>
          </ModalFooter>
        </ModalContainer>
      </Modal>

      {/* Ban Member Modal */}
      <Modal isOpen={showBanModal} onOpenChange={(open) => setShowBanModal(open)}>
        <ModalBackdrop />
        <ModalContainer>
          <ModalHeader>Ban Member</ModalHeader>
          <ModalBody>
            <p className="text-[#949ba4] mb-4">Are you sure you want to ban this member? They will not be able to rejoin.</p>
            <TextField>
              <Label>Reason (optional)</Label>
              <TextArea value={banReason} onChange={(e) => setBanReason(e.target.value)} />
            </TextField>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onPress={() => setShowBanModal(false)}>Cancel</Button>
            <Button color="danger" variant="primary" onPress={handleBanMember}>Ban Member</Button>
          </ModalFooter>
        </ModalContainer>
      </Modal>

      {/* Create Channel Modal */}
      <Modal isOpen={showChannelModal} onOpenChange={(open) => setShowChannelModal(open)}>
        <ModalBackdrop />
        <ModalContainer>
          <ModalHeader>Create Channel</ModalHeader>
          <ModalBody>
            <TextField>
              <Label>Channel Name</Label>
              <Input value={newChannelName} onChange={(e) => setNewChannelName(e.target.value)} />
            </TextField>
            <div className="mt-4">
              <Label>Channel Type</Label>
              <Select selectedKey={newChannelType} onSelectionChange={(key) => setNewChannelType(key as "text" | "voice")}>
                <ListBox>
                  <ListBoxItem key="text">Text Channel</ListBoxItem>
                  <ListBoxItem key="voice">Voice Channel</ListBoxItem>
                </ListBox>
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onPress={() => setShowChannelModal(false)}>Cancel</Button>
            <Button color="primary" variant="primary" onPress={handleCreateChannel}>Create</Button>
          </ModalFooter>
        </ModalContainer>
      </Modal>

      {/* Create Category Modal */}
      <Modal isOpen={showCategoryModal} onOpenChange={(open) => setShowCategoryModal(open)}>
        <ModalBackdrop />
        <ModalContainer>
          <ModalHeader>Create Category</ModalHeader>
          <ModalBody>
            <TextField>
              <Label>Category Name</Label>
              <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
            </TextField>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onPress={() => setShowCategoryModal(false)}>Cancel</Button>
            <Button color="primary" variant="primary" onPress={handleCreateCategory}>Create</Button>
          </ModalFooter>
        </ModalContainer>
      </Modal>
    </div>
  );
}
