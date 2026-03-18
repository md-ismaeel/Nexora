import { useNavigate, useParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { openModal } from "@/store/slices/ui.slice";
import { useGetMyServersQuery } from "@/api/server.api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Plus, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Server icon pill animation (Discord-style squircle → pill on hover)
interface NavBtnProps {
  label: string;
  active?: boolean;
  notify?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function NavBtn({ label, active, notify, onClick, children }: NavBtnProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative flex items-center">
            {/* Active pill indicator */}
            <span
              className={cn(
                "absolute -left-3 w-1 rounded-r-full bg-white transition-all duration-200",
                active ? "h-10 opacity-100" : "h-0 opacity-0",
              )}
            />
            {/* Hover pip (when not active) */}
            {!active && notify && (
              <span className="absolute -left-3 h-2 w-1 rounded-r-full bg-white opacity-80" />
            )}

            <button
              onClick={onClick}
              className={cn(
                "relative flex h-12 w-12 items-center justify-center overflow-hidden transition-all duration-200",
                active
                  ? "rounded-[16px] bg-[#5865f2] text-white"
                  : "rounded-[24px] bg-[#2b2d31] text-[#dbdee1] hover:rounded-[16px] hover:bg-[#5865f2] hover:text-white",
              )}
            >
              {children}
              {/* Unread badge */}
              {notify && !active && (
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#1e1f22] bg-[#ed4245]" />
              )}
            </button>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="border-none bg-[#111214] text-sm text-white"
        >
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Abbreviate server name to 1-2 initials for the icon
function serverInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function ServerSidebar() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { serverId } = useParams();

  // Load server list (seeds Redux store via onQueryStarted)
  useGetMyServersQuery();
  const servers = useAppSelector((s) => s.server.servers);

  return (
    <nav className="flex w-[72px] flex-col items-center gap-2 overflow-y-auto bg-[#1e1f22] py-3 scrollbar-none">
      {/* Home / Friends */}
      <NavBtn
        label="Direct Messages"
        active={!serverId}
        onClick={() => navigate("/friends")}
      >
        <MessageCircle className="h-6 w-6" />
      </NavBtn>

      <Separator className="mx-auto w-8 bg-[#35363c]" />

      {/* Server list */}
      {servers.map((server) => (
        <NavBtn
          key={server._id}
          label={server.name}
          active={serverId === server._id}
          onClick={() => navigate(`/servers/${server._id}`)}
        >
          {server.icon ? (
            <img
              src={server.icon}
              alt={server.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-bold">
              {serverInitials(server.name)}
            </span>
          )}
        </NavBtn>
      ))}

      <Separator className="mx-auto w-8 bg-[#35363c]" />

      {/* Add server */}
      <NavBtn
        label="Add a Server"
        onClick={() => dispatch(openModal({ modal: "createServer" }))}
      >
        <Plus className="h-6 w-6" />
      </NavBtn>

      {/* Explore public servers */}
      <NavBtn label="Explore Discoverable Servers" onClick={() => {}}>
        <Compass className="h-6 w-6" />
      </NavBtn>
    </nav>
  );
}
