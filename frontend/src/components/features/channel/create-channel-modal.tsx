// create-channel-modal.tsx
import { useState } from "react";
import { Modal, Button, Input, TextField, Label, Switch } from "@heroui/react";
import { HashIcon, LockIcon, VolumeIcon } from "@/utils/lucide";

export interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    type: "text" | "voice";
    isPrivate: boolean;
    topic?: string;
  }) => void;
}

export function CreateChannelModal({ isOpen, onClose, onCreate }: CreateChannelModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"text" | "voice">("text");
  const [isPrivate, setIsPrivate] = useState(false);
  const [topic, setTopic] = useState("");

  const resetForm = () => {
    setName(""); setType("text"); setIsPrivate(false); setTopic("");
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate({ name: name.trim(), type, isPrivate, topic: topic.trim() || undefined });
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen}>
      <Modal.Backdrop />
      <Modal.Container>
        <Modal.Dialog>
          <Modal.CloseTrigger />

          <Modal.Header>
            <Modal.Heading>Create Channel</Modal.Heading>
          </Modal.Header>

          <Modal.Body>
            <div className="flex flex-col gap-4 py-4">
              {/* Channel type selector */}
              <div className="flex gap-2">
                <Button
                  variant={type === "text" ? "primary" : "ghost"}
                  onPress={() => setType("text")}
                >
                  <HashIcon className="h-4 w-4 mr-1" />
                  Text
                </Button>
                <Button
                  variant={type === "voice" ? "primary" : "ghost"}
                  onPress={() => setType("voice")}
                >
                  <VolumeIcon className="h-4 w-4 mr-1" />
                  Voice
                </Button>
              </div>

              {/* v3 TextField — compound: <TextField><Label /><Input /><FieldError /></TextField> */}
              <TextField>
                <Label>Channel Name</Label>
                <Input
                  placeholder="new-channel"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value.toLowerCase().replace(/\s+/g, "-"))
                  }
                />
              </TextField>

              {type === "text" && (
                <TextField>
                  <Label>Topic (optional)</Label>
                  <Input
                    placeholder="What is this channel about?"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </TextField>
              )}

              {/* Private toggle */}
              {/* v3 Switch — simple component; isSelected + onChange for controlled */}
              <div className="flex items-center justify-between rounded-lg bg-[#2b2d31] p-3">
                <div className="flex items-center gap-2 text-sm text-[#dbdee1]">
                  <LockIcon className="h-4 w-4" />
                  Private Channel
                </div>
                <Switch isSelected={isPrivate} onChange={() => setIsPrivate((v) => !v)} />
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
              Create Channel
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal>
  );
}

export default CreateChannelModal;