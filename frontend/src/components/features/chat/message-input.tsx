import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { SendIcon, Paperclip, SmileIcon, StickerIcon, XIcon } from "@/utils/lucide"
import { cn } from "@/utils/utils"

export interface MessageInputProps {
  onSend: (content: string, attachments?: File[]) => void
  placeholder?: string
  disabled?: boolean
  isSending?: boolean
  channelName?: string
  className?: string
}

export function MessageInput({
  onSend,
  placeholder = "Message",
  disabled = false,
  isSending = false,
  channelName,
  className,
}: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    if ((message.trim() || attachments.length > 0) && !disabled) {
      onSend(message.trim(), attachments)
      setMessage("")
      setAttachments([])
      textareaRef.current?.focus()
    }
  }, [message, attachments, onSend, disabled])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setAttachments((prev) => [...prev, ...files])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const removeAttachment = (index: number) =>
    setAttachments((prev) => prev.filter((_, i) => i !== index))

  const displayPlaceholder = channelName ? `Message #${channelName}` : placeholder

  return (
    <div className={cn("flex flex-col gap-2 px-4 pb-4", className)}>
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-lg bg-[#2b2d31] p-2">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded bg-[#1e1f22] px-2 py-1 text-sm"
            >
              <Paperclip className="h-4 w-4" />
              <span className="max-w-[150px] truncate">{file.name}</span>
              <button
                onClick={() => removeAttachment(index)}
                className="rounded p-0.5 hover:bg-[#3f4147]"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 rounded-lg bg-[#383a42] p-2">
        <div className="flex items-center gap-1">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  className="rounded-full p-2 text-[#b5bac1] transition-colors hover:bg-[#4e5058] disabled:opacity-50"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Attach file</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={displayPlaceholder}
            disabled={disabled}
            rows={1}
            className="w-full resize-none bg-transparent text-[#dbdee1] placeholder-[#949ba4] outline-none scrollbar-hide"
            style={{ maxHeight: "200px", minHeight: "24px" }}
          />
        </div>

        <div className="flex items-center gap-1">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  disabled={disabled}
                  className="rounded-full p-2 text-[#b5bac1] transition-colors hover:bg-[#4e5058] disabled:opacity-50"
                >
                  <StickerIcon className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Stickers</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  disabled={disabled}
                  className="rounded-full p-2 text-[#b5bac1] transition-colors hover:bg-[#4e5058] disabled:opacity-50"
                >
                  <SmileIcon className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Emoji</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {(message.trim() || attachments.length > 0) && (
          <Button
            size="sm"
            onClick={handleSend}
            disabled={disabled || isSending}
            className="min-w-[32px] bg-[#5865f2] text-white hover:bg-[#4752c4]"
          >
            {isSending ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <SendIcon className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  )
}

export default MessageInput
