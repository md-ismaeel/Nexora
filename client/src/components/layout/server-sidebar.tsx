import { useNavigate, useParams } from "react-router-dom"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { openModal } from "@/store/slices/ui_slice"
import { useGetMyServersQuery } from "@/api/server_api"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/utils/utils"
import {
  motion,
  AnimatePresence,
  Sidebar as SidebarMotion,
  makeStagger,
  vp,
} from "@/utils/motion"
import { SidebarIcons, UIIcons } from "@/utils/lucide"

interface NavBtnProps {
  label: string
  active?: boolean
  notify?: boolean
  onClick: () => void
  children: React.ReactNode
}

function NavBtn({ label, active, notify, onClick, children }: NavBtnProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative flex items-center">
            <motion.span
              animate={{
                height: active ? 40 : notify ? 8 : 0,
                opacity: active || notify ? 1 : 0,
              }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              className="absolute -left-3 w-1 rounded-r-full bg-white"
            />

            <motion.button
              onClick={onClick}
              whileHover={{
                scale: 1.08,
                borderRadius: "30%",
                transition: { type: "spring", stiffness: 420, damping: 30 },
              }}
              whileTap={{ scale: 0.92 }}
              className={cn(
                "relative flex h-12 w-12 items-center justify-center overflow-hidden transition-all duration-200",
                active
                  ? "rounded-[16px] bg-[#5865f2] text-white"
                  : "rounded-[24px] bg-[#2b2d31] text-[#dbdee1]",
              )}
            >
              {children}
              {notify && !active && (
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#1e1f22] bg-[#ed4245]" />
              )}
            </motion.button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function serverInitials(name: string) {
  const w = name.trim().split(/\s+/)
  return w.length === 1 ? w[0].slice(0, 2).toUpperCase() : (w[0][0] + w[1][0]).toUpperCase()
}

export default function ServerSidebar() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { serverId } = useParams()

  useGetMyServersQuery()
  const servers = useAppSelector((s) => s.server.servers)

  return (
    <motion.nav
      {...vp(SidebarMotion.serverRail)}
      className="flex w-[72px] flex-col items-center gap-2 overflow-y-auto bg-[#1e1f22] py-3 scrollbar-none"
    >
      <NavBtn label="Direct Messages" active={!serverId} onClick={() => navigate("/channels/me")}>
        <SidebarIcons.DirectMessages className="h-6 w-6" />
      </NavBtn>

      <div className="mx-auto h-px w-8 bg-[#35363c]" />

      <motion.div
        variants={makeStagger({ staggerChildren: 0.04 })}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-2"
      >
        <AnimatePresence>
          {servers?.map((server) => (
            <NavBtn
              key={server._id}
              label={server.name}
              active={serverId === server._id}
              onClick={() => navigate(`/servers/${server._id}`)}
            >
              {server.icon
                ? <img src={server.icon} alt={server.name} className="h-full w-full object-cover" />
                : <span className="text-sm font-bold">{serverInitials(server.name)}</span>
              }
            </NavBtn>
          ))}
        </AnimatePresence>
      </motion.div>

      <div className="mx-auto h-px w-8 bg-[#35363c]" />

      <NavBtn label="Add a Server" onClick={() => dispatch(openModal({ modal: "createServer" }))}>
        <UIIcons.Add className="h-6 w-6" />
      </NavBtn>

      <NavBtn label="Explore Discoverable Servers" onClick={() => navigate("/discover")}>
        <SidebarIcons.Discover className="h-6 w-6" />
      </NavBtn>
    </motion.nav>
  )
}
