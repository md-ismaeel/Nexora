import { useState, useRef, useCallback } from "react";
import { Button, Tooltip } from "@heroui/react";
import {
  SendIcon,
  Paperclip,
  SmileIcon,
  StickerIcon,
  MicIcon,
  XIcon,
} from "@/utils/lucide";
import { cn } from "@/utils/utils";

export interface MessageInputProps {
  onSend: (content: string, attachments?: File[]) => void;
  placeholder?: string;
  disabled?: boolean;
  channelName?: string;
  className?: string;
}

export function MessageInput({
  onSend,
  placeholder = "Message",
  disabled = false,
  channelName,
  className,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    if ((message.trim() || attachments.length > 0) && !disabled) {
      onSend(message.trim(), attachments);
      setMessage("");
      setAttachments([]);
      textareaRef.current?.focus();
    }
  }, [message, attachments, onSend, disabled]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const displayPlaceholder = channelName ? `Message #${channelName}` : placeholder;

  return (
    <div className={cn("flex flex-col gap-2 px-4 pb-4", className)}>
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-[#2b2d31]">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-2 py-1 rounded bg-[#1e1f22] text-sm"
            >
              <Paperclip className="w-4 h-4" />
              <span className="max-w-[150px] truncate">{file.name}</span>
              <button
                onClick={() => removeAttachment(index)}
                className="p-0.5 rounded hover:bg-[#3f4147]"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 p-2 rounded-lg bg-[#383a42]">
        <div className="flex items-center gap-1">
          <Tooltip content="Attach file">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="p-2 rounded-full hover:bg-[#4e5058] text-[#b5bac1] transition-colors disabled:opacity-50"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </Tooltip>
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
            className="w-full bg-transparent text-[#dbdee1] placeholder-[#949ba4] resize-none outline-none scrollbar-hide"
            style={{ maxHeight: "200px", minHeight: "24px" }}
          />
        </div>

        <div className="flex items-center gap-1">
          <Tooltip content="Stickers">
            <button
              disabled={disabled}
              className="p-2 rounded-full hover:bg-[#4e5058] text-[#b5bac1] transition-colors disabled:opacity-50"
            >
              <StickerIcon className="w-5 h-5" />
            </button>
          </Tooltip>
          <Tooltip content="Emoji">
            <button
              disabled={disabled}
              className="p-2 rounded-full hover:bg-[#4e5058] text-[#b5bac1] transition-colors disabled:opacity-50"
            >
              <SmileIcon className="w-5 h-5" />
            </button>
          </Tooltip>
        </div>

        {(message.trim() || attachments.length > 0) && (
          <Button
            isIconOnly
            size="sm"
            color="primary"
            variant="flat"
            onPress={handleSend}
            disabled={disabled}
            className="min-w-[32px]"
          >
            <SendIcon className="w-4 h-4" />
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
  );
}

export default MessageInput;
