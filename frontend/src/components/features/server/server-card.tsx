import { Avatar, Button, Modal, Input, useOverlayState } from "@heroui/react";
import { useState } from "react";
import { UploadIcon, SparklesIcon } from "@/utils/lucide";
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

export function ServerCard({
  name,
  icon,
  memberCount,
  isSelected,
  hasUnread,
  onClick,
  onSettingsClick,
  className,
}: ServerCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
        "hover:rounded-2xl hover:bg-[#4e5058]",
        isSelected ? "bg-[#5865f2]" : "bg-[#2b2d31]",
        className
      )}
    >
      {icon ? (
        <Avatar src={icon} name={name} size="lg" />
      ) : (
        <Avatar name={name} size="lg" className="bg-[#5865f2]" />
      )}
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white truncate">{name}</h3>
        {memberCount !== undefined && (
          <p className="text-sm text-[#b5bac1]">{memberCount} members</p>
        )}
      </div>

      {hasUnread && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#23a559]" />
      )}

      {onSettingsClick && (
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={(e) => {
            e.stopPropagation();
            onSettingsClick();
          }}
          className="opacity-0 group-hover:opacity-100 text-white"
        >
          <SparklesIcon className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

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
    if (name.trim()) {
      onCreate(name.trim(), icon || undefined);
      setName("");
      setIcon(null);
      setPreview(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Backdrop />
      <Modal.Container>
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>Create Server</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <div className="flex flex-col items-center gap-4 py-4">
              <label className="relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleIconChange}
                />
                <div className="w-28 h-28 rounded-full bg-[#5865f2] flex items-center justify-center overflow-hidden">
                  {preview || icon ? (
                    <img src={preview || ""} alt="Server icon" className="w-full h-full object-cover" />
                  ) : (
                    <UploadIcon className="w-10 h-10 text-white" />
                  )}
                </div>
                <div className="absolute bottom-0 right-0 p-2 rounded-full bg-[#5865f2] text-white">
                  <SparklesIcon className="w-4 h-4" />
                </div>
              </label>

              <div className="w-full max-w-xs">
                <Input
                  label="Server Name"
                  placeholder="Enter server name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="flat" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleCreate} isDisabled={!name.trim()}>
              Create Server
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal>
  );
}

export default ServerCard;
