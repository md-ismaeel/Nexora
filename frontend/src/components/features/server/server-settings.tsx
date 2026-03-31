import { Avatar, Button, Input, Modal, Select, SelectItem, Tabs, Tab } from "@heroui/react";
import { useState } from "react";
import { cn } from "@/utils/utils";
import type { IServer, IChannel, IRole } from "@/types/server.types";

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
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <Modal.Backdrop />
      <Modal.Container>
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>{server.name} - Settings</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <Tabs aria-label="Server settings" selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as string)}>
              <Tab key="overview" title="Overview">
                <div className="flex flex-col gap-4 py-4">
                  <div className="flex items-center gap-4">
                    <Avatar src={server.icon} name={server.name} className="w-20 h-20" />
                    <div>
                      <h3 className="text-lg font-semibold">{server.name}</h3>
                      <p className="text-sm text-[#949ba4]">Server ID: {server._id}</p>
                    </div>
                  </div>
                  
                  <Input
                    label="Server Name"
                    value={server.name}
                    onChange={(e) => onUpdate({ name: e.target.value })}
                  />
                  
                  <Input
                    label="Description"
                    value={server.description || ""}
                    onChange={(e) => onUpdate({ description: e.target.value })}
                  />
                </div>
              </Tab>
              
              <Tab key="channels" title="Channels">
                <div className="py-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">Text Channels</h4>
                    <Button size="sm" variant="flat">Add Channel</Button>
                  </div>
                  <div className="space-y-2">
                    {channels.filter(c => c.type === "text").map((channel) => (
                      <div key={channel._id} className="flex items-center justify-between p-2 rounded bg-[#2b2d31]">
                        <span># {channel.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Tab>
              
              <Tab key="roles" title="Roles">
                <div className="py-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">Roles</h4>
                    <Button size="sm" variant="flat">Add Role</Button>
                  </div>
                  <div className="space-y-2">
                    {roles.map((role) => (
                      <div key={role._id} className="flex items-center gap-3 p-2 rounded bg-[#2b2d31]">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: role.color }} />
                        <span>{role.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Tab>
              
              <Tab key="members" title="Members">
                <div className="py-4">
                  <p className="text-[#949ba4]">Member management coming soon...</p>
                </div>
              </Tab>
            </Tabs>
          </Modal.Body>
          <Modal.Footer>
            {onLeave && (
              <Button color="warning" variant="flat" onPress={onLeave}>
                Leave Server
              </Button>
            )}
            {onDelete && (
              <Button color="danger" variant="flat" onPress={onDelete}>
                Delete Server
              </Button>
            )}
            <Button variant="flat" onPress={onClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal>
  );
}

export default ServerSettings;
