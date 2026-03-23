import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useGetServerByIdQuery,
  useUpdateServerMutation,
  useDeleteServerMutation,
  useGetServerMembersQuery,
  useKickMemberMutation,
  useGetServerInvitesQuery,
  useCreateInviteMutation,
  useDeleteInviteMutation,
} from "@/api/server_api";
import {
  useGetServerRolesQuery,
  useCreateRoleMutation,
  useDeleteRoleMutation,
} from "@/api/role_api";
import { useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/custom/user-avatar";
import { cn } from "@/lib/utils/utils";
// ── Motion
import {
  motion,
  AnimatePresence,
  Modals,
  vp,
  makeStagger,
  Primitives,
} from "@/lib/motion";
// ── Icons
import {
  ServerIcons,
  ModerationIcons,
  UIIcons,
  SettingsIcons,
} from "@/lib/lucide";

// ── Overview tab ──────────────────────────────────────────────────────────────

const overviewSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean(),
});
type OverviewForm = z.infer<typeof overviewSchema>;

function OverviewTab({ serverId }: { serverId: string }) {
  const { data: serverData } = useGetServerByIdQuery(serverId);
  const [update, { isLoading, isSuccess }] = useUpdateServerMutation();
  const server = serverData?.data.server;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
  } = useForm<OverviewForm>({
    resolver: zodResolver(overviewSchema),
    values: {
      name: server?.name ?? "",
      description: server?.description ?? "",
      isPublic: server?.isPublic ?? false,
    },
  });

  const isPublic = watch("isPublic");

  const onSubmit = async (values: OverviewForm) => {
    await update({ id: serverId, ...values }).unwrap();
  };

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Server Overview</h2>
        <p className="text-sm text-[#949ba4]">
          Manage your server's name, icon and visibility.
        </p>
      </div>

      {isSuccess && (
        <div className="rounded-md border border-green-500/20 bg-green-500/10 px-3 py-2 text-sm text-green-400">
          Server updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wide text-[#b5bac1]">
            Server Name
          </Label>
          <Input
            {...register("name")}
            className="border-none bg-[#1e1f22] text-white focus-visible:ring-[#5865f2]"
          />
          {errors.name && (
            <p className="text-xs text-[#ed4245]">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wide text-[#b5bac1]">
            Description
          </Label>
          <Textarea
            {...register("description")}
            rows={3}
            placeholder="What's your server about?"
            className="resize-none border-none bg-[#1e1f22] text-white placeholder:text-[#4e5058] focus-visible:ring-[#5865f2]"
          />
        </div>

        <div className="flex items-center justify-between rounded-lg bg-[#2b2d31] p-4">
          <div>
            <p className="font-medium text-white">Public Server</p>
            <p className="text-xs text-[#949ba4]">
              Anyone with the link or in Discover can join.
            </p>
          </div>
          <Switch
            checked={isPublic}
            onCheckedChange={(v) =>
              setValue("isPublic", v, { shouldDirty: true })
            }
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading || !isDirty}
          className="bg-[#5865f2] text-white hover:bg-[#4752c4] disabled:opacity-60"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}

// ── Members tab ───────────────────────────────────────────────────────────────

function MembersTab({ serverId }: { serverId: string }) {
  const { data: membersData } = useGetServerMembersQuery(serverId);
  const [kick, { isLoading: kicking }] = useKickMemberMutation();
  const members = membersData?.data.members ?? [];
  const me = useAppSelector((s) => s.auth.user);

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">
          Members — {members.length}
        </h2>
        <p className="text-sm text-[#949ba4]">
          Manage server members and their roles.
        </p>
      </div>

      <motion.div
        variants={makeStagger()}
        initial="hidden"
        animate="visible"
        className="space-y-1"
      >
        {members?.map((m) => {
          const user = m.user as {
            _id: string;
            username?: string;
            name: string;
            avatar?: string;
            status: string;
          };
          const isMe = user._id === me?._id;
          return (
            <motion.div
              key={m._id}
              variants={Primitives.slideUp}
              className="flex items-center gap-3 rounded-lg px-4 py-2 hover:bg-[#35363c]"
            >
              <UserAvatar
                name={user.name}
                avatar={user.avatar}
                status={user.status as "online" | "offline" | "away" | "dnd"}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-[#dbdee1]">
                  {user.username ?? user.name}
                </p>
                <Badge
                  variant="secondary"
                  className={cn(
                    "mt-0.5 h-4 text-[10px]",
                    m.role === "owner"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : m.role === "admin"
                        ? "bg-[#5865f2]/20 text-[#5865f2]"
                        : m.role === "moderator"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-[#35363c] text-[#949ba4]",
                  )}
                >
                  {m.role}
                </Badge>
              </div>
              {!isMe && m.role !== "owner" && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={kicking}
                  onClick={() => kick({ serverId, memberId: user._id })}
                  className="text-[#ed4245] hover:bg-[#ed4245]/10 hover:text-[#ed4245]"
                >
                  <ModerationIcons.Kick className="mr-1.5 h-3.5 w-3.5" />
                  Kick
                </Button>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

// ── Invites tab ───────────────────────────────────────────────────────────────

function InvitesTab({ serverId }: { serverId: string }) {
  const { data: invitesData, refetch } = useGetServerInvitesQuery(serverId);
  const [createInvite, { isLoading: creating }] = useCreateInviteMutation();
  const [deleteInvite] = useDeleteInviteMutation();
  const invites = invitesData?.data.invites ?? [];

  const handleCreate = async () => {
    await createInvite({ serverId }).unwrap();
    refetch();
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Invites</h2>
          <p className="text-sm text-[#949ba4]">Manage active invite links.</p>
        </div>
        <Button
          onClick={handleCreate}
          disabled={creating}
          className="bg-[#5865f2] text-white hover:bg-[#4752c4]"
        >
          <UIIcons.Add className="mr-1.5 h-4 w-4" />
          Create Invite
        </Button>
      </div>

      <motion.div
        variants={makeStagger()}
        initial="hidden"
        animate="visible"
        className="space-y-2"
      >
        <AnimatePresence>
          {invites.map((inv) => (
            <motion.div
              key={inv._id}
              {...vp(Primitives.slideUp)}
              className="flex items-center gap-3 rounded-lg bg-[#2b2d31] px-4 py-3"
            >
              <ServerIcons.InviteLink className="h-5 w-5 shrink-0 text-[#949ba4]" />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm font-semibold text-white">
                  discord.gg/{inv.code}
                </p>
                <div className="flex gap-3 text-xs text-[#949ba4]">
                  <span>
                    {inv.uses}
                    {inv.maxUses ? `/${inv.maxUses}` : ""} uses
                  </span>
                  {inv.expiresAt && (
                    <span>
                      Expires {new Date(inv.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/invite/${inv.code}`,
                  );
                }}
                className="p-1.5 text-[#949ba4] hover:text-white transition-colors"
              >
                <UIIcons.Copy className="h-4 w-4" />
              </button>
              <button
                onClick={async () => {
                  await deleteInvite(inv.code);
                  refetch();
                }}
                className="p-1.5 text-[#949ba4] hover:text-[#ed4245] transition-colors"
              >
                <UIIcons.Remove className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {invites.length === 0 && (
          <p className="py-8 text-center text-sm text-[#4e5058]">
            No active invites. Create one above.
          </p>
        )}
      </motion.div>
    </div>
  );
}

// ── Danger zone tab ───────────────────────────────────────────────────────────

function DangerTab({ serverId }: { serverId: string }) {
  const navigate = useNavigate();
  const [deleteServer, { isLoading }] = useDeleteServerMutation();
  const [confirm, setConfirm] = useState("");
  const { data: serverData } = useGetServerByIdQuery(serverId);
  const serverName = serverData?.data.server?.name ?? "";

  const handleDelete = async () => {
    if (confirm !== serverName) return;
    await deleteServer(serverId).unwrap();
    navigate("/channels/@me", { replace: true });
  };

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#ed4245]">Danger Zone</h2>
        <p className="text-sm text-[#949ba4]">
          Irreversible actions — proceed with caution.
        </p>
      </div>

      <div className="rounded-lg border border-[#ed4245]/20 bg-[#ed4245]/5 p-6 space-y-4">
        <div>
          <p className="font-semibold text-white">Delete this server</p>
          <p className="text-sm text-[#949ba4]">
            Once you delete a server, there is no going back. All channels,
            messages, and members will be permanently removed.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-[#949ba4]">
            Type <strong className="text-white">{serverName}</strong> to confirm
          </Label>
          <Input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={serverName}
            className="border-[#ed4245]/20 bg-[#1e1f22] text-white placeholder:text-[#4e5058] focus-visible:ring-[#ed4245]"
          />
        </div>

        <Button
          onClick={handleDelete}
          disabled={isLoading || confirm !== serverName}
          variant="destructive"
          className="w-full border border-[#ed4245]/20 bg-[#ed4245]/10 text-[#ed4245] hover:bg-[#ed4245] hover:text-white disabled:opacity-40"
        >
          {isLoading ? "Deleting..." : "Delete Server"}
        </Button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const TABS = [
  { value: "overview", label: "Overview", icon: SettingsIcons.MyAccount },
  { value: "members", label: "Members", icon: SettingsIcons.VoiceAndVideo },
  { value: "invites", label: "Invites", icon: ServerIcons.InviteLink },
  { value: "danger", label: "Danger Zone", icon: ModerationIcons.Shield },
];

export default function ServerSettingsPage() {
  const { serverId } = useParams<{ serverId: string }>();
  const navigate = useNavigate();

  if (!serverId) return null;

  return (
    <motion.div
      {...vp(Modals.settings)}
      className="flex flex-1 overflow-hidden"
    >
      {/* Left nav */}
      <nav className="w-56 shrink-0 overflow-y-auto bg-[#2b2d31] px-2 py-6">
        <p className="mb-1 px-3 text-[11px] font-bold uppercase tracking-wide text-[#949ba4]">
          Server Settings
        </p>
        <Tabs defaultValue="overview" orientation="vertical">
          <TabsList className="flex-col h-auto w-full gap-0.5 bg-transparent p-0">
            {TABS.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className={cn(
                  "flex w-full items-center gap-2 justify-start rounded px-3 py-1.5 text-sm data-[state=active]:bg-[#404249] data-[state=active]:text-white",
                  value === "danger" &&
                    "text-[#ed4245] data-[state=active]:bg-[#ed4245]/10 data-[state=active]:text-[#ed4245]",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Separator className="my-2 bg-[#3f4147]" />

        <button
          onClick={() => navigate(-1)}
          className="flex w-full items-center gap-2 rounded px-3 py-1.5 text-sm text-[#949ba4] hover:bg-[#35363c] hover:text-[#dbdee1]"
        >
          <UIIcons.Close className="h-4 w-4" />
          Close
        </button>
      </nav>

      {/* Content */}
      <Tabs defaultValue="overview" className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto px-10 py-8">
          <TabsContent value="overview">
            <OverviewTab serverId={serverId} />
          </TabsContent>
          <TabsContent value="members">
            <MembersTab serverId={serverId} />
          </TabsContent>
          <TabsContent value="invites">
            <InvitesTab serverId={serverId} />
          </TabsContent>
          <TabsContent value="danger">
            <DangerTab serverId={serverId} />
          </TabsContent>
        </main>
      </Tabs>
    </motion.div>
  );
}
