import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { HashIcon, LockIcon, VolumeIcon } from "@/utils/lucide"

export interface CreateChannelModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: {
    name: string
    type: "text" | "voice"
    isPrivate: boolean
    topic?: string
  }) => void
}

export function CreateChannelModal({ isOpen, onClose, onCreate }: CreateChannelModalProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState<"text" | "voice">("text")
  const [isPrivate, setIsPrivate] = useState(false)
  const [topic, setTopic] = useState("")

  const resetForm = () => {
    setName(""); setType("text"); setIsPrivate(false); setTopic("")
  }

  const handleCreate = () => {
    if (!name.trim()) return
    onCreate({ name: name.trim(), type, isPrivate, topic: topic.trim() || undefined })
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-[500px] bg-[#2b2d31] border-[#1e1f22]">
        <DialogHeader>
          <DialogTitle className="text-white">Create Channel</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex gap-2">
            <Button
              variant={type === "text" ? "default" : "ghost"}
              onClick={() => setType("text")}
              className={type === "text" ? "bg-[#5865f2]" : "text-[#dbdee1]"}
            >
              <HashIcon className="mr-1 h-4 w-4" />
              Text
            </Button>
            <Button
              variant={type === "voice" ? "default" : "ghost"}
              onClick={() => setType("voice")}
              className={type === "voice" ? "bg-[#5865f2]" : "text-[#dbdee1]"}
            >
              <VolumeIcon className="mr-1 h-4 w-4" />
              Voice
            </Button>
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="channel-name" className="text-[#dbdee1]">Channel Name</Label>
            <Input
              id="channel-name"
              placeholder="new-channel"
              value={name}
              onChange={(e) =>
                setName(e.target.value.toLowerCase().replace(/\s+/g, "-"))
              }
              className="bg-[#1e1f22] text-white placeholder-[#949ba4] border-[#3f4147]"
            />
          </div>

          {type === "text" && (
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="channel-topic" className="text-[#dbdee1]">Topic (optional)</Label>
              <Input
                id="channel-topic"
                placeholder="What is this channel about?"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-[#1e1f22] text-white placeholder-[#949ba4] border-[#3f4147]"
              />
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg bg-[#1e1f22] p-3">
            <div className="flex items-center gap-2 text-sm text-[#dbdee1]">
              <LockIcon className="h-4 w-4" />
              Private Channel
            </div>
            <Switch checked={isPrivate} onCheckedChange={() => setIsPrivate((v) => !v)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-[#dbdee1]">
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="bg-[#5865f2] hover:bg-[#4752c4]"
          >
            Create Channel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateChannelModal
