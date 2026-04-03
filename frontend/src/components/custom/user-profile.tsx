import { useNavigate } from "react-router-dom"
import { useAppSelector } from "@/store/hooks"
import { useGetUserByIdQuery } from "@/api/user_api"
import { useBlockUserMutation } from "@/api/user_api"
import {
    useSendFriendRequestMutation,
    useGetFriendsQuery,
    useRemoveFriendMutation,
} from "@/api/friend_api"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/custom/user-avatar"
import { motion, Modals, vp } from "@/utils/motion"
import { UserIcons, ChatIcons, UIIcons } from "@/utils/lucide"
import { cn } from "@/utils/utils"
import type { IUser } from "@/types/user.types"

const STATUS_CONFIG: Record<IUser["status"], { label: string; color: string }> = {
    online: { label: "Online", color: "bg-green-500" },
    away: { label: "Away", color: "bg-yellow-500" },
    dnd: { label: "Do Not Disturb", color: "bg-red-500" },
    offline: { label: "Offline", color: "bg-[#747f8d]" },
}

function StatusBadge({ status }: { status: IUser["status"] }) {
    const cfg = STATUS_CONFIG[status]
    return (
        <span className="flex items-center gap-1.5 text-sm text-[#949ba4]">
            <span className={cn("h-2 w-2 rounded-full shrink-0", cfg.color)} />
            {cfg.label}
        </span>
    )
}

interface UserProfileProps {
    userId: string
    onClose: () => void
}

export function UserProfile({ userId, onClose }: UserProfileProps) {
    const navigate = useNavigate()
    const me = useAppSelector((s) => s.auth.user)

    const { data: userData, isLoading } = useGetUserByIdQuery(userId, { skip: !userId })

    const { data: friendsData } = useGetFriendsQuery()
    const [sendRequest, { isLoading: sending }] = useSendFriendRequestMutation()
    const [removeFriend, { isLoading: removing }] = useRemoveFriendMutation()
    const [blockUser] = useBlockUserMutation()

    const user = userData?.data.user
    const friends = (friendsData?.data ?? []) as IUser[]
    const isFriend = friends.some((f) => f._id === userId)
    const isMe = me?._id === userId

    const handleMessage = () => {
        onClose()
        navigate(`/channels/@me/${userId}`)
    }

    const handleAddFriend = () => sendRequest(userId)
    const handleRemoveFriend = () => removeFriend(userId)
    const handleBlock = async () => {
        await blockUser(userId)
        onClose()
    }

    if (isLoading || !user) {
        return (
            <motion.div
                {...vp(Modals.dialog)}
                className="w-72 rounded-xl bg-[#2b2d31] p-6 shadow-2xl"
            >
                <div className="flex animate-pulse flex-col gap-3">
                    <div className="h-16 w-16 rounded-full bg-[#404249]" />
                    <div className="h-4 w-32 rounded bg-[#404249]" />
                    <div className="h-3 w-48 rounded bg-[#35363c]" />
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            {...vp(Modals.dialog)}
            className="w-72 overflow-hidden rounded-xl bg-[#2b2d31] shadow-2xl"
        >
            <div className="relative h-16 bg-gradient-to-br from-[#5865f2] to-[#7289da]">
                <button
                    onClick={onClose}
                    className="absolute right-2 top-2 rounded p-1 text-white/70 hover:text-white"
                >
                    <UIIcons.Close className="h-4 w-4" />
                </button>

                <div className="absolute -bottom-6 left-4">
                    <div className="rounded-full border-4 border-[#2b2d31]">
                        <UserAvatar
                            name={user.name}
                            avatar={user.avatar}
                            status={user.status}
                            size="lg"
                            showStatusTooltip
                        />
                    </div>
                </div>
            </div>

            <div className="px-4 pb-4 pt-8">
                <div className="mb-1">
                    <p className="text-lg font-bold text-white">{user.name}</p>
                    {user.username && (
                        <p className="text-sm text-[#949ba4]">@{user.username}</p>
                    )}
                </div>

                <StatusBadge status={user.status} />

                {user.customStatus && (
                    <p className="mt-1 text-sm italic text-[#949ba4]">
                        &ldquo;{user.customStatus}&rdquo;
                    </p>
                )}

                {user.bio && (
                    <>
                        <div className="my-3 h-px bg-[#3f4147]" />
                        <div>
                            <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#949ba4]">
                                About Me
                            </p>
                            <p className="text-sm text-[#dbdee1]">{user.bio}</p>
                        </div>
                    </>
                )}

                {user.createdAt && (
                    <>
                        <div className="my-3 h-px bg-[#3f4147]" />
                        <div>
                            <p className="mb-0.5 text-[11px] font-bold uppercase tracking-wide text-[#949ba4]">
                                Member Since
                            </p>
                            <p className="text-sm text-[#dbdee1]">
                                {new Date(user.createdAt).toLocaleDateString(undefined, {
                                    year: "numeric", month: "long", day: "numeric",
                                })}
                            </p>
                        </div>
                    </>
                )}

                <div className="my-3 h-px bg-[#3f4147]" />

                {!isMe && (
                    <div className="flex flex-col gap-2">
                        <Button
                            onClick={handleMessage}
                            className="w-full bg-[#5865f2] text-white hover:bg-[#4752c4]"
                            size="sm"
                        >
                            <ChatIcons.Send className="mr-2 h-4 w-4" />
                            Send Message
                        </Button>

                        {isFriend ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRemoveFriend}
                                disabled={removing}
                                className="w-full border-[#4e5058] text-[#949ba4] hover:border-[#ed4245] hover:text-[#ed4245]"
                            >
                                <UserIcons.RemoveFriend className="mr-2 h-4 w-4" />
                                Remove Friend
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleAddFriend}
                                disabled={sending}
                                className="w-full border-[#4e5058] text-[#949ba4] hover:border-[#5865f2] hover:text-[#5865f2]"
                            >
                                <UserIcons.AddFriend className="mr-2 h-4 w-4" />
                                {sending ? "Sending…" : "Add Friend"}
                            </Button>
                        )}

                        <button
                            onClick={handleBlock}
                            className="w-full rounded py-1 text-xs text-[#4e5058] hover:text-[#ed4245] transition-colors"
                        >
                            Block User
                        </button>
                    </div>
                )}

                {isMe && (
                    <Button
                        onClick={() => { onClose(); navigate("/settings") }}
                        variant="outline"
                        size="sm"
                        className="w-full border-[#4e5058] text-[#dbdee1] hover:bg-[#35363c]"
                    >
                        <UserIcons.EditProfile className="mr-2 h-4 w-4" />
                        Edit Profile
                    </Button>
                )}
            </div>
        </motion.div>
    )
}
