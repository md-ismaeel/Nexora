import { Modal, Button, Input, Switch } from "@heroui/react";
import { useState } from "react";
import { HashIcon, VolumeUpIcon, LockIcon } from "@/utils/lucide";

export interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; type: "text" | "voice"; isPrivate: boolean; topic?: string }) => void;
}

export function CreateChannelModal({ isOpen, onClose, onCreate }: CreateChannelModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"text" | "voice">("text");
  const [isPrivate, setIsPrivate] = useState(false);
  const [topic, setTopic] = useState("");

  const handleCreate = () => {
    if (name.trim()) {
      onCreate({ name: name.trim(), type, isPrivate, topic: topic.trim() || undefined });
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setName("");
    setType("text");
    setIsPrivate(false);
    setTopic("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Backdrop />
      <Modal.Container>
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>Create Channel</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex gap-2">
                <Button
                  variant={type === "text" ? "solid" : "flat"}
                  color={type === "text" ? "primary" : "default"}
                  onPress={() => setType("text")}
                  startContent={<HashIcon className="w-4 h-4" />}
                >
                  Text
                </Button>
                <Button
                  variant={type === "voice" ? "solid" : "flat"}
                  color={type === "voice" ? "primary" : "default"}
                  onPress={() => setType("voice")}
                  startContent={<VolumeUpIcon className="w-4 h-4" />}
                >
                  Voice
                </Button>
              </div>

              <Input
                label="Channel Name"
                placeholder="new-channel"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              />

              {type === "text" && (
                <Input
                  label="Topic (optional)"
                  placeholder="What is this channel about?"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              )}

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#2b2d31]">
                <div className="flex items-center gap-2">
                  <LockIcon className="w-4 h-4" />
                  <span className="text-sm">Private Channel</span>
                </div>
                <Switch
                  isSelected={isPrivate}
                  onValueChange={setIsPrivate}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="flat" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleCreate} isDisabled={!name.trim()}>
              Create Channel
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal>
  );
}

export default CreateChannelModal;
