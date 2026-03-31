import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Avatar,
  Button,
  Input,
  Textarea,
  Tabs,
  Tab,
  Card,
  Chip,
  Alert,
} from "@heroui/react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { ServerSettings } from "@/components/features/server/server-settings";
import {
  SettingsIcon,
  ShieldIcon,
  UsersIcon,
  HashIcon,
  VolumeUpIcon,
  PlusIcon,
  TrashIcon,
  EditIcon,
  CopyIcon,
  CheckIcon,
} from "@/utils/lucide";
import type { IServer, IChannel, IRole } from "@/types/server.types";

const mockRoles: IRole[] = [
  {
    _id: "1",
    name: "@everyone",
    color: "#99AAB5",
    server: "",
    permissions: {
      administrator: false,
      manageServer: false,
      manageRoles: false,
      manageChannels: false,
      kickMembers: false,
      banMembers: false,
      createInvite: true,
      manageMessages: false,
      sendMessages: true,
      readMessages: true,
      mentionEveryone: false,
      connect: true,
      speak: true,
      muteMembers: false,
      deafenMembers: false,
    },
    position: 0,
    isDefault: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    _id: "2",
    name: "Moderator",
    color: "#FAA61A",
    server: "",
    permissions: {
      administrator: false,
      manageServer: false,
      manageRoles: true,
      manageChannels: true,
      kickMembers: true,
      banMembers: true,
      createInvite: true,
      manageMessages: true,
      sendMessages: true,
      readMessages: true,
      mentionEveryone: true,
      connect: true,
      speak: true,
      muteMembers: true,
      deafenMembers: true,
    },
    position: 1,
    isDefault: false,
    createdAt: "",
    updatedAt: "",
  },
];

export default function ServerSettingsPage() {
  const { serverId } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);

  const servers = useSelector((state: RootState) => state.server.servers);
  const server = servers.find((s) => s._id === serverId) as IServer | undefined;

  if (!server) {
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

  const handleDelete = () => {
    console.log("Delete server");
  };

  const handleLeave = () => {
    console.log("Leave server");
  };

  const mockChannels: IChannel[] = [
    { _id: "1", name: "general", type: "text", server: "", position: 0, isPrivate: false, allowedRoles: [], createdAt: "", updatedAt: "" },
    { _id: "2", name: "announcements", type: "text", server: "", position: 1, isPrivate: false, allowedRoles: [], createdAt: "", updatedAt: "" },
    { _id: "3", name: "voice-1", type: "voice", server: "", position: 0, isPrivate: false, allowedRoles: [], createdAt: "", updatedAt: "" },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#313338]">
      <div className="flex items-center justify-between px-4 h-12 border-b border-[#1f2023]">
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-white">{server.name} Settings</h1>
        </div>
        <Button variant="flat" onPress={() => navigate(`/servers/${serverId}`)}>
          Back to Channel
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <Tabs
            aria-label="Server settings tabs"
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key as string)}
            classNames={{
              tabList: "bg-transparent gap-4 p-0",
              cursor: "bg-[#5865f2]",
            }}
          >
            <Tab key="overview" title="Overview" className="p-4">
              <Card className="bg-[#2b2d31]">
                <Card.Content className="flex flex-col gap-6">
                  <div className="flex items-center gap-6">
                    <Avatar
                      src={server.icon}
                      name={server.name}
                      className="w-24 h-24"
                      size="lg"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-white">{server.name}</h3>
                      <p className="text-sm text-[#949ba4]">Server ID: {server._id}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="Server Name"
                      value={server.name}
                      classNames={{
                        inputWrapper: "bg-[#1e1f22]",
                      }}
                    />
                    <Textarea
                      label="Description"
                      value={server.description || ""}
                      placeholder="What's this server about?"
                      classNames={{
                        inputWrapper: "bg-[#1e1f22]",
                      }}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-white">Invite Link</h4>
                    <div className="flex gap-2">
                      <Input
                        placeholder="abc123"
                        value={inviteCode}
                        onValueChange={setInviteCode}
                        classNames={{
                          inputWrapper: "bg-[#1e1f22]",
                        }}
                        startContent={
                          <span className="text-[#949ba4]">discord.gg/</span>
                        }
                      />
                      <Button
                        variant="flat"
                        onPress={handleCopyInvite}
                        startContent={copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                      >
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </Tab>

            <Tab key="channels" title="Channels" className="p-4">
              <Card className="bg-[#2b2d31]">
                <Card.Content className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-white flex items-center gap-2">
                        <HashIcon className="w-4 h-4" /> Text Channels
                      </h4>
                      <Button size="sm" variant="flat" startContent={<PlusIcon className="w-4 h-4" />}>
                        Add Channel
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {mockChannels.filter(c => c.type === "text").map((channel) => (
                        <div key={channel._id} className="flex items-center justify-between p-3 rounded bg-[#1e1f22]">
                          <span className="text-[#dbdee1]"># {channel.name}</span>
                          <div className="flex gap-1">
                            <Button isIconOnly size="sm" variant="light">
                              <EditIcon className="w-4 h-4" />
                            </Button>
                            <Button isIconOnly size="sm" variant="light" className="text-[#ed4245]">
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-white flex items-center gap-2">
                        <VolumeUpIcon className="w-4 h-4" /> Voice Channels
                      </h4>
                      <Button size="sm" variant="flat" startContent={<PlusIcon className="w-4 h-4" />}>
                        Add Channel
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {mockChannels.filter(c => c.type === "voice").map((channel) => (
                        <div key={channel._id} className="flex items-center justify-between p-3 rounded bg-[#1e1f22]">
                          <span className="text-[#dbdee1]">🔊 {channel.name}</span>
                          <div className="flex gap-1">
                            <Button isIconOnly size="sm" variant="light">
                              <EditIcon className="w-4 h-4" />
                            </Button>
                            <Button isIconOnly size="sm" variant="light" className="text-[#ed4245]">
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </Tab>

            <Tab key="roles" title="Roles" className="p-4">
              <Card className="bg-[#2b2d31]">
                <Card.Content>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-white flex items-center gap-2">
                      <ShieldIcon className="w-4 h-4" /> Roles
                    </h4>
                    <Button size="sm" variant="flat" startContent={<PlusIcon className="w-4 h-4" />}>
                      Create Role
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {mockRoles.map((role) => (
                      <div key={role._id} className="flex items-center justify-between p-3 rounded bg-[#1e1f22]">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: role.color }} />
                          <span className="text-[#dbdee1]">{role.name}</span>
                          {role.isDefault && <Chip size="sm" variant="flat">Default</Chip>}
                        </div>
                        <div className="flex gap-1">
                          <Button isIconOnly size="sm" variant="light">
                            <EditIcon className="w-4 h-4" />
                          </Button>
                          {!role.isDefault && (
                            <Button isIconOnly size="sm" variant="light" className="text-[#ed4245]">
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Content>
              </Card>
            </Tab>

            <Tab key="members" title="Members" className="p-4">
              <Card className="bg-[#2b2d31]">
                <Card.Content>
                  <p className="text-[#949ba4]">Member management coming soon...</p>
                </Card.Content>
              </Card>
            </Tab>
          </Tabs>
        </div>
      </div>

      <div className="flex justify-end gap-2 p-4 border-t border-[#1f2023]">
        <Button variant="flat" onPress={() => navigate(`/servers/${serverId}`)}>
          Cancel
        </Button>
        <Button color="primary">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
