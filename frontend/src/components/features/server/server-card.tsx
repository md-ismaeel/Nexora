import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UploadIcon, SparklesIcon, SettingsIcon } from "@/utils/lucide"
import { cn } from "@/utils/utils"

export interface ServerCardProps {
  id: string
  name: string
  icon?: string
  memberCount?: number
  isSelected?: boolean
  hasUnread?: boolean
  onClick: () => void
  onSettingsClick?: () => void
  className?: string
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
      <Avatar className="h-12 w-12 rounded-full bg-[#5865f2]">
        {icon && <AvatarImage src={icon} alt={name} />}
        <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
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
        <Button
          size="sm"
          variant="ghost"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
            onSettingsClick()
          }}
          className="opacity-0 group-hover:opacity-100 text-white"
        >
          <SettingsIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

export interface CreateServerModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string, icon?: File) => void
}

export function CreateServerModal({ isOpen, onClose, onCreate }: CreateServerModalProps) {
  const [name, setName] = useState("")
  const [icon, setIcon] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIcon(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleCreate = () => {
    if (!name.trim()) return
    onCreate(name.trim(), icon ?? undefined)
    setName("")
    setIcon(null)
    setPreview(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogTrigger asChild>
        <Button className="hidden">Open</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-[#2b2d31] border-[#1e1f22]">
        <DialogHeader>
          <DialogTitle className="text-white">Create Server</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
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

          <div className="w-full max-w-xs">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="server-name" className="text-[#949ba4]">Server Name</Label>
              <Input
                id="server-name"
                placeholder="Enter server name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#1e1f22] text-white placeholder-[#949ba4] border-[#3f4147]"
              />
            </div>
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
            Create Server
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
