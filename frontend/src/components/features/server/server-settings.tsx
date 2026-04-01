import { useState } from "react";
import {
  Avatar,
  Button,
  Input,
  TextField,
  Label,
  Modal,
  Select,
  ListBox,
  Tabs,
  Tab,
} from "@heroui/react";

import type { IServer, IChannel } from "@/types/server.types";
import type { IRole } from "@/api/role_api";

export interface ServerSettingsProps {
  server: IServer;
  channels: IChannel[];
  roles: IRole[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: Partial<IServer>) => void;
  onDelete?: () => void;
  onLeave?: () => void;
}

export function ServerSettings({
  server,
  channels,
  roles,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onLeave,
}: ServerSettingsProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "channels" | "roles" | "members"
  >("overview");

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <Modal.Backdrop />

      <Modal.Container className="max-w-3xl">
        <Modal.Dialog>
          <Modal.CloseTrigger />

          {/* HEADER */}
          <Modal.Header>
            <Modal.Heading>
              {server.name} — Settings
            </Modal.Heading>
          </Modal.Header>

          {/* BODY */}
          <Modal.Body>
            {/* ✅ Tabs (labels only) */}
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) =>
                setActiveTab(key as typeof activeTab)
              }
              aria-label="Server settings"
              className="w-full"
              variant="secondary"
            >
              <Tab key="overview">Overview</Tab>
              <Tab key="channels">Channels</Tab>
              <Tab key="roles">Roles</Tab>
              <Tab key="members">Members</Tab>
            </Tabs>

            {/* ✅ Tab Content (manual rendering) */}
            <div className="mt-4">
              {/* ── Overview ── */}
              {activeTab === "overview" && (
                <div className="flex flex-col gap-4 py-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 rounded-full bg-[#5865f2] text-xl">
                      {server.icon && (
                        <Avatar.Image
                          src={server.icon}
                          alt={server.name}
                        />
                      )}
                      <Avatar.Fallback>
                        {server.name.slice(0, 2).toUpperCase()}
                      </Avatar.Fallback>
                    </Avatar>

                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {server.name}
                      </h3>
                      <p className="text-sm text-[#949ba4]">
                        Server ID: {server._id}
                      </p>
                    </div>
                  </div>

                  <TextField>
                    <Label>Server Name</Label>
                    <Input
                      value={server.name}
                      onChange={(e) =>
                        onUpdate({ name: e.target.value })
                      }
                    />
                  </TextField>

                  <TextField>
                    <Label>Description</Label>
                    <Input
                      value={server.description ?? ""}
                      onChange={(e) =>
                        onUpdate({ description: e.target.value })
                      }
                    />
                  </TextField>

                  <Select
                    selectedKey={
                      server.isPublic ? "public" : "private"
                    }
                    onSelectionChange={(key) =>
                      onUpdate({ isPublic: key === "public" })
                    }
                    placeholder="Visibility"
                    className="w-full"
                  >
                    <Label>Visibility</Label>
                    <ListBox>
                      <ListBox.Item key="public">
                        Public
                      </ListBox.Item>
                      <ListBox.Item key="private">
                        Private
                      </ListBox.Item>
                    </ListBox>
                  </Select>
                </div>
              )}

              {/* ── Channels ── */}
              {activeTab === "channels" && (
                <div className="py-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-semibold text-white">
                      Text Channels
                    </h4>
                    <Button size="sm" variant="ghost">
                      Add Channel
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {channels
                      .filter((c) => c.type === "text")
                      .map((channel) => (
                        <div
                          key={channel._id}
                          className="flex items-center justify-between rounded bg-[#2b2d31] p-2 text-[#dbdee1]"
                        >
                          <span># {channel.name}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* ── Roles ── */}
              {activeTab === "roles" && (
                <div className="py-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-semibold text-white">
                      Roles
                    </h4>
                    <Button size="sm" variant="ghost">
                      Add Role
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {roles.map((role) => (
                      <div
                        key={role._id}
                        className="flex items-center gap-3 rounded bg-[#2b2d31] p-2"
                      >
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{
                            backgroundColor: role.color,
                          }}
                        />
                        <span className="text-[#dbdee1]">
                          {role.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Members ── */}
              {activeTab === "members" && (
                <div className="py-4">
                  <p className="text-[#949ba4]">
                    Member management coming soon…
                  </p>
                </div>
              )}
            </div>
          </Modal.Body>

          {/* FOOTER */}
          <Modal.Footer>
            {onLeave && (
              <Button variant="ghost" onPress={onLeave}>
                Leave Server
              </Button>
            )}

            {onDelete && (
              <Button variant="ghost" onPress={onDelete}>
                Delete Server
              </Button>
            )}

            <Button variant="ghost" onPress={onClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal>
  );
}

export default ServerSettings;