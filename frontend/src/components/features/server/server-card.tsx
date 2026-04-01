import { useState } from "react";
import { Avatar, Button, Modal, Input, TextField, Label } from "@heroui/react";
import { UploadIcon, SparklesIcon, SettingsIcon } from "@/utils/lucide";
import { cn } from "@/utils/utils";

export interface ServerCardProps {
  id: string;
  name: string;
  icon?: string;
  memberCount?: number;
  isSelected?: boolean;
  hasUnread?: boolean;
  onClick: () => void;
  onSettingsClick?: () => void;
  className?: string;
}

export function ServerCard({ name, icon, memberCount, isSelected, hasUnread, onClick, onSettingsClick, className }: ServerCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-all",
        "hover:rounded-2xl hover:bg-[#4e5058]",
        isSelected ? "bg-[#5865f2]" : "bg-[#2b2d31]",
        className,
      )}
    >
      {/* v3 Avatar — compound pattern */}
      <Avatar className="h-12 w-12 rounded-full bg-[#5865f2]">
        {icon && <Avatar.Image src={icon} alt={name} />}
        <Avatar.Fallback>{name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-white">{name}</h3>
        {memberCount !== undefined && (
          <p className="text-sm text-[#b5bac1]">{memberCount} members</p>
        )}
      </div>

      {hasUnread && (
        <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#23a559]" />
      )}

      {onSettingsClick && (
        // v3 Button — use isIconOnly, onPress, and stop event bubbling via e.continuePropagation(false)
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          onPress={(e) => {
            // PressEvent from React Aria — stop the outer div onClick
            (e as unknown as { stopPropagation?: () => void }).stopPropagation?.();
            onSettingsClick();
          }}
          className="opacity-0 group-hover:opacity-100 text-white"
        >
          <SettingsIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

// ── Create server modal ───────────────────────────────────────────────────────

export interface CreateServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, icon?: File) => void;
}

export function CreateServerModal({ isOpen, onClose, onCreate }: CreateServerModalProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIcon(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), icon ?? undefined);
    setName(""); setIcon(null); setPreview(null);
    onClose();
  };

  return (
    // v3 Modal — compound pattern
    <Modal isOpen={isOpen}>
      <Modal.Backdrop />
      <Modal.Container className="max-w-lg">
        <Modal.Dialog>
          <Modal.CloseTrigger />

          <Modal.Header>
            <Modal.Heading>Create Server</Modal.Heading>
          </Modal.Header>

          <Modal.Body>
            <div className="flex flex-col items-center gap-4 py-4">
              {/* Icon upload */}
              <label className="relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleIconChange}
                />
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-[#5865f2]">
                  {preview ? (
                    <img src={preview} alt="Server icon" className="h-full w-full object-cover" />
                  ) : (
                    <UploadIcon className="h-10 w-10 text-white" />
                  )}
                </div>
                <div className="absolute bottom-0 right-0 rounded-full bg-[#5865f2] p-2 text-white">
                  <SparklesIcon className="h-4 w-4" />
                </div>
              </label>

              {/* Server name */}
              <div className="w-full max-w-xs">
                <TextField>
                  <Label>Server Name</Label>
                  <Input
                    placeholder="Enter server name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </TextField>
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="ghost" onPress={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onPress={handleCreate}
              isDisabled={!name.trim()}
            >
              Create Server
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal>
  );
}

export default ServerCard;