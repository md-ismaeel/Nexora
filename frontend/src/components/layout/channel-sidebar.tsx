import { useState } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { openModal } from "@/store/slices/ui_slice"
import { useAuth } from "@/hooks/use-auth"
import { useGetServerCategoriesQuery } from "@/api/category_api"
import { useGetFriendsQuery } from "@/api/friend_api"
import { useGetServerByIdQuery } from "@/api/server_api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserAvatar } from "@/components/custom/user-avatar"
import { cn } from "@/utils/utils"
import type { IChannel, IChannelCategory } from "@/types/server.types"
import type { IUser } from "@/types/user.types"
import { motion, AnimatePresence, Sidebar, makeStagger } from "@/utils/motion"
import { SidebarIcons, VoiceIcons, UIIcons, UserIcons } from "@/utils/lucide"

function ChannelItem({
  channel,
  active,
  onClick,
}: {
  channel: IChannel
  active: boolean
  onClick: () => void
}) {
  const Icon =
    channel.type === "voice"
      ? VoiceIcons.SpeakerOn
      : channel.isPrivate
        ? SidebarIcons.LockedChannel
        : SidebarIcons.TextChannel

  return (
    <motion.button
      variants={Sidebar.channelRow}
      onClick={onClick}
      whileHover={{
        x: 2,
        backgroundColor: active ? "rgba(64,66,73,1)" : "rgba(53,54,60,0.6)",
        transition: { duration: 0.1 },
      }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group flex w-full items-center gap-1.5 rounded px-2 py-[5px] text-sm transition-colors",
        active ? "bg-[#404249] text-white" : "text-[#949ba4]",
      )}
    >
      <Icon className="h-4 w-4 shrink-0 opacity-70" />
      <span className="flex-1 truncate text-left">{channel.name}</span>
    </motion.button>
  )
}

function DmItem({
  friend,
  active,
  unread,
}: {
  friend: IUser
  active: boolean
  unread: number
}) {
  const navigate = useNavigate()

  return (
    <motion.button
      variants={Sidebar.channelRow}
      onClick={() => navigate(`/channels/me/${friend._id}`)}
      whileHover={{
        x: 2,
        backgroundColor: active ? "rgba(64,66,73,1)" : "rgba(53,54,60,0.6)",
        transition: { duration: 0.1 },
      }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group flex w-full items-center gap-2 rounded px-2 py-[5px] transition-colors",
        active ? "bg-[#404249] text-white" : "text-[#949ba4]",
      )}
    >
      <UserAvatar
        name={friend.name}
        avatar={friend.avatar}
        status={friend.status}
        size="sm"
      />
      <div className="flex min-w-0 flex-1 flex-col items-start">
        <span className="truncate text-sm font-medium">
          {friend.username ?? friend.name}
        </span>
        <span className="truncate text-xs capitalize opacity-60">{friend.status}</span>
      </div>

      {unread > 0 && (
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ed4245] px-1 text-[10px] font-bold text-white">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </motion.button>
  )
}

function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            className="text-[#949ba4] transition-colors hover:text-white"
          >
            <UIIcons.Add className="h-3.5 w-3.5" />
          </motion.button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function ServerPanel({ serverId }: { serverId: string }) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { channelId } = useParams()
  const { data: serverData } = useGetServerByIdQuery(serverId)
  const { data: categoriesData, isError: categoriesError } = useGetServerCategoriesQuery(serverId)

  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")

  const server = serverData?.data
  const categories = (categoriesData?.data?.categories ?? []) as (IChannelCategory & { channels: IChannel[] })[]
  const uncategorized = (categoriesData?.data?.uncategorized ?? []) as IChannel[]

  const textUncategorized = uncategorized.filter((c) => c.type === "text")
  const voiceUncategorized = uncategorized.filter((c) => c.type === "voice")

  const handleCreateChannel = () =>
    dispatch(openModal({ modal: "createChannel", data: { serverId } }))

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    setNewCategoryName("")
    setShowCategoryModal(false)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex h-12 shrink-0 items-center justify-between border-b border-[#1e1f22] px-4 shadow-sm"
      >
        <span className="truncate font-semibold text-white">
          {(server as { name?: string } | undefined)?.name ?? "Loading…"}
        </span>
        <SidebarIcons.ServerMenu className="h-4 w-4 shrink-0 text-[#949ba4]" />
      </motion.div>

      <ScrollArea className="flex-1 overflow-y-auto px-2 py-2">
        {categoriesError ? (
          <p className="px-2 py-4 text-center text-xs text-[#ed4245]">
            Failed to load channels
          </p>
        ) : (
          <motion.div
            variants={makeStagger({ staggerChildren: 0.03 })}
            initial="hidden"
            animate="visible"
          >
            {categories.map((category) => {
              const textChannels = category.channels.filter((c) => c.type === "text")
              const voiceChannels = category.channels.filter((c) => c.type === "voice")

              return (
                <div key={category._id} className="mb-3">
                  <div className="flex items-center justify-between px-1 py-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-[#949ba4]">
                      {category.name}
                    </span>
                  </div>
                  {textChannels.map((ch) => (
                    <ChannelItem
                      key={ch._id}
                      channel={ch}
                      active={channelId === ch._id}
                      onClick={() => navigate(`/servers/${serverId}/${ch._id}`)}
                    />
                  ))}
                  {voiceChannels.map((ch) => (
                    <ChannelItem
                      key={ch._id}
                      channel={ch}
                      active={channelId === ch._id}
                      onClick={() => navigate(`/servers/${serverId}/${ch._id}`)}
                    />
                  ))}
                </div>
              )
            })}

            {textUncategorized.length > 0 && (
              <div className="mb-1">
                <div className="flex items-center justify-between px-1 py-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[#949ba4]">
                    Text Channels
                  </span>
                  <AddBtn label="Create Text Channel" onClick={handleCreateChannel} />
                </div>
                {textUncategorized.map((ch) => (
                  <ChannelItem
                    key={ch._id}
                    channel={ch}
                    active={channelId === ch._id}
                    onClick={() => navigate(`/servers/${serverId}/${ch._id}`)}
                  />
                ))}
              </div>
            )}

            {voiceUncategorized.length > 0 && (
              <div className="mb-1">
                <div className="flex items-center justify-between px-1 py-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[#949ba4]">
                    Voice Channels
                  </span>
                  <AddBtn label="Create Voice Channel" onClick={handleCreateChannel} />
                </div>
                {voiceUncategorized.map((ch) => (
                  <ChannelItem
                    key={ch._id}
                    channel={ch}
                    active={channelId === ch._id}
                    onClick={() => navigate(`/servers/${serverId}/${ch._id}`)}
                  />
                ))}
              </div>
            )}

            {categories.length === 0 && uncategorized.length === 0 && (
              <p className="px-2 py-4 text-center text-xs text-[#4e5058]">
                No channels yet
              </p>
            )}
          </motion.div>
        )}
      </ScrollArea>

      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogTrigger asChild>
          <Button variant="ghost" className="hidden">Open</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category name"
              className="bg-[#1e1f22] text-white placeholder-[#949ba4] border-[#3f4147]"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCategoryModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCategory}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function DmPanel() {
  const navigate = useNavigate()
  const location = useLocation()
  const { userId } = useParams()
  const unreadCounts = useAppSelector((s) => s.dm.unreadCounts)
  const { data: friendsData, isError } = useGetFriendsQuery()

  const friends = (friendsData?.data ?? []) as IUser[]

  return (
    <>
      <div className="flex h-12 shrink-0 items-center border-b border-[#1e1f22] px-4 shadow-sm">
        <span className="font-semibold text-white">Direct Messages</span>
      </div>

      <ScrollArea className="flex-1 overflow-y-auto px-2 py-2">
        <motion.button
          onClick={() => navigate("/channels/me")}
          whileHover={{ x: 2, backgroundColor: "rgba(53,54,60,0.6)", transition: { duration: 0.1 } }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "flex w-full items-center gap-2 rounded px-2 py-[6px] text-sm font-medium transition-colors",
            location.pathname === "/channels/me"
              ? "bg-[#404249] text-white"
              : "text-[#949ba4]",
          )}
        >
          <UserIcons.FriendsList className="h-4 w-4 shrink-0" />
          Friends
        </motion.button>

        <div className="my-2 h-px bg-[#35363c]" />

        {isError ? (
          <p className="px-2 py-4 text-center text-xs text-[#ed4245]">
            Failed to load conversations
          </p>
        ) : friends.length > 0 ? (
          <motion.div
            variants={makeStagger({ staggerChildren: 0.03 })}
            initial="hidden"
            animate="visible"
          >
            <p className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-[#949ba4]">
              Direct Messages
            </p>
            <AnimatePresence>
              {friends.map((f) => (
                <DmItem
                  key={f._id}
                  friend={f}
                  active={userId === f._id}
                  unread={unreadCounts[f._id] ?? 0}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : null}
      </ScrollArea>
    </>
  )
}

function UserPanel() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [muted, setMuted] = useState(false)
  const [deafened, setDeafened] = useState(false)

  if (!user) return null

  const controls = [
    {
      icon: muted ? VoiceIcons.MicOff : VoiceIcons.MicOn,
      label: muted ? "Unmute" : "Mute",
      active: muted, onClick: () => setMuted((v) => !v),
    },
    {
      icon: deafened ? VoiceIcons.SpeakerOff : VoiceIcons.Headphones,
      label: deafened ? "Undeafen" : "Deafen",
      active: deafened, onClick: () => setDeafened((v) => !v),
    },
    {
      icon: UserIcons.Profile,
      label: "User Settings",
      active: false,
      onClick: () => navigate("/settings"),
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
      className="flex h-[52px] shrink-0 items-center gap-2 border-t border-[#1e1f22] bg-[#232428] px-2"
    >
      <motion.button
        onClick={() => navigate("/settings")}
        whileHover={{ backgroundColor: "rgba(53,54,60,0.8)", transition: { duration: 0.1 } }}
        whileTap={{ scale: 0.98 }}
        className="flex min-w-0 flex-1 items-center gap-2 rounded px-1 py-1"
      >
        <UserAvatar
          name={user.name}
          avatar={user.avatar}
          status={user.status}
          size="sm"
        />
        <div className="flex min-w-0 flex-col text-left">
          <span className="truncate text-sm font-semibold leading-none text-white">
            {user.username ?? user.name}
          </span>
          <span className="truncate text-[11px] leading-none text-[#949ba4]">
            {user.customStatus || `#${user._id.slice(-4)}`}
          </span>
        </div>
      </motion.button>

      <div className="flex items-center">
        <TooltipProvider delayDuration={300}>
          {controls.map(({ icon: Icon, label, active, onClick }) => (
            <Tooltip key={label}>
              <TooltipTrigger asChild>
                <motion.button
                  onClick={onClick}
                  whileHover={{ scale: 1.12, transition: { type: "spring", stiffness: 420, damping: 30 } }}
                  whileTap={{ scale: 0.88 }}
                  className={cn(
                    "rounded p-1.5 transition-colors",
                    active
                      ? "text-[#ed4245] hover:bg-[#ed4245]/10"
                      : "text-[#b5bac1] hover:bg-[#35363c] hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          ))}

          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                onClick={logout}
                whileHover={{ scale: 1.12, transition: { type: "spring", stiffness: 420, damping: 30 } }}
                whileTap={{ scale: 0.88 }}
                className="rounded p-1.5 text-[#b5bac1] transition-colors hover:bg-[#ed4245] hover:text-white"
              >
                <UserIcons.ReportUser className="h-4 w-4 rotate-180" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>Log Out</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </motion.div>
  )
}

export default function ChannelSidebar() {
  const { serverId } = useParams()
  return (
    <aside className="flex w-60 shrink-0 flex-col bg-[#2b2d31]">
      {serverId ? <ServerPanel serverId={serverId} /> : <DmPanel />}
      <UserPanel />
    </aside>
  )
}
