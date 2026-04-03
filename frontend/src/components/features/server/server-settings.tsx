import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { IServer, IChannel } from "@/types/server.types";
import type { IRole } from "@/api/role_api";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

  const [visibility, setVisibility] = useState(server.isPublic ? "public" : "private");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl bg-[#2b2d31] text-white max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{server.name} — Settings</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as typeof activeTab)}
          className="w-full mt-4"
        >
          <TabsList className="bg-[#1e1f22] w-full justify-start">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#5865f2]">Overview</TabsTrigger>
            <TabsTrigger value="channels" className="data-[state=active]:bg-[#5865f2]">Channels</TabsTrigger>
            <TabsTrigger value="roles" className="data-[state=active]:bg-[#5865f2]">Roles</TabsTrigger>
            <TabsTrigger value="members" className="data-[state=active]:bg-[#5865f2]">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="flex flex-col gap-4 py-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-[#5865f2] flex items-center justify-center text-xl text-white overflow-hidden">
                  {server.icon ? (
                    <AvatarImage src={server.icon} alt={server.name} className="w-full h-full object-cover" />
                  ) : (
                    <AvatarFallback>{server.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {server.name}
                  </h3>
                  <p className="text-sm text-[#949ba4]">
                    Server ID: {server._id}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm text-[#949ba4] mb-1 block">Server Name</label>
                <Input
                  value={server.name}
                  onChange={(e) =>
                    onUpdate({ name: e.target.value })
                  }
                  className="bg-[#1e1f22] border-[#3f4147] text-white"
                />
              </div>

              <div>
                <label className="text-sm text-[#949ba4] mb-1 block">Description</label>
                <Textarea
                  value={server.description ?? ""}
                  onChange={(e) =>
                    onUpdate({ description: e.target.value })
                  }
                  className="bg-[#1e1f22] border-[#3f4147] text-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-[#949ba4]">Visibility</label>
                <div className="flex gap-2">
                  <Button
                    variant={visibility === "public" ? "default" : "secondary"}
                    size="sm"
                    onClick={() => {
                      setVisibility("public");
                      onUpdate({ isPublic: true });
                    }}
                  >
                    Public
                  </Button>
                  <Button
                    variant={visibility === "private" ? "default" : "secondary"}
                    size="sm"
                    onClick={() => {
                      setVisibility("private");
                      onUpdate({ isPublic: false });
                    }}
                  >
                    Private
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="channels" className="mt-4">
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
          </TabsContent>

          <TabsContent value="roles" className="mt-4">
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
          </TabsContent>

          <TabsContent value="members" className="mt-4">
            <div className="py-4">
              <p className="text-[#949ba4]">
                Member management coming soon…
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          {onLeave && (
            <Button variant="ghost" onClick={onLeave}>
              Leave Server
            </Button>
          )}

          {onDelete && (
            <Button variant="ghost" onClick={onDelete}>
              Delete Server
            </Button>
          )}

          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ServerSettings;
