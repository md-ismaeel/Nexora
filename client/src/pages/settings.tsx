import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { X, User, Shield, Bell, Palette, Lock, Camera, Check } from "lucide-react";
import {
  useGetMeQuery,
  useUpdateProfileMutation,
  useUpdateStatusMutation,
  // FIX: removed useDeleteAvatarMutation — no DELETE /users/me/avatar route on backend
} from "@/api/user.api";
import { useAppSelector } from "@/store/hooks";
import { useAuth } from "@/hooks/use-auth";
// Avatar upload uses axios directly (multipart/form-data — not handled by RTK Query base)
import { api } from "@/lib/axios";
import { UserAvatar } from "@/components/custom/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils/utils";
import type { IUser } from "@/types/user.types";

// ── Nav ───────────────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  {
    title: "User Settings",
    items: [
      { id: "profile", label: "My Profile", icon: User },
      { id: "account", label: "Account", icon: Shield },
      { id: "privacy", label: "Privacy & Safety", icon: Lock },
      { id: "appearance", label: "Appearance", icon: Palette },
      { id: "notifications", label: "Notifications", icon: Bell },
    ],
  },
];

// ── Status options 
const STATUSES: { value: IUser["status"]; label: string; color: string }[] = [
  { value: "online", label: "Online", color: "bg-green-500" },
  { value: "away", label: "Away", color: "bg-yellow-500" },
  { value: "dnd", label: "Do Not Disturb", color: "bg-red-500" },
  { value: "offline", label: "Appear Offline", color: "bg-[#747f8d]" },
];

// ── Profile tab 
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(32),
  username: z.string().min(3).max(32).optional().or(z.literal("")),
  bio: z.string().max(190, "Max 190 characters").optional(),
  customStatus: z.string().max(128).optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

function ProfileTab({ user }: { user: IUser }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [update, { isLoading, isSuccess }] = useUpdateProfileMutation();
  const [updateStatus] = useUpdateStatusMutation();

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      username: user.username ?? "",
      bio: user.bio ?? "",
      customStatus: user.customStatus ?? "",
    },
  });

  const onSubmit = async (values: ProfileForm) => {
    await update(values).unwrap();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);
    setAvatarLoading(true);
    try {
      const form = new FormData();
      form.append("avatar", file);
      // FIX: was api.patch — backend route is POST /users/me/avatar
      await api.post("/users/me/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch {
      setAvatarError("Failed to upload avatar. Please try again.");
    } finally {
      setAvatarLoading(false);
      // Reset file input so the same file can be re-selected if needed
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white">My Profile</h2>
        <p className="text-sm text-[#949ba4]">Manage how you appear to others.</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-5 rounded-lg bg-[#2b2d31] p-5">
        <div className="relative">
          <UserAvatar name={user.name} avatar={user.avatar} status={user.status} size="lg" />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={avatarLoading}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity hover:opacity-100"
          >
            <Camera className="h-5 w-5 text-white" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white">{user.username ?? user.name}</p>
          <p className="truncate text-sm text-[#949ba4]">{user.email}</p>
          {avatarError && <p className="mt-1 text-xs text-[#ed4245]">{avatarError}</p>}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={avatarLoading}
          className="border-[#4e5058] text-[#dbdee1] hover:bg-[#35363c]"
        >
          {avatarLoading ? "Uploading..." : "Change"}
        </Button>
        {/* FIX: removed "Remove" button — no DELETE /users/me/avatar backend route.
            Implement the backend endpoint before re-adding this. */}
      </div>

      {/* Status picker */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#b5bac1]">Status</p>
        <div className="grid grid-cols-2 gap-2">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => updateStatus({ status: s.value })}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                user.status === s.value
                  ? "border-[#5865f2] bg-[#5865f2]/10 text-white"
                  : "border-[#3f4147] bg-[#2b2d31] text-[#949ba4] hover:border-[#5865f2]/50 hover:text-white",
              )}
            >
              <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", s.color)} />
              <span className="flex-1 text-left">{s.label}</span>
              {user.status === s.value && <Check className="h-3.5 w-3.5 text-[#5865f2]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Success banner */}
      {isSuccess && (
        <div className="rounded-md border border-green-500/20 bg-green-500/10 px-3 py-2 text-sm text-green-400">
          Profile saved successfully!
        </div>
      )}

      {/* Profile form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {[
          { id: "name", label: "Display Name", placeholder: "John Doe" },
          { id: "username", label: "Username", placeholder: "john_doe" },
          { id: "customStatus", label: "Custom Status", placeholder: "Playing something cool" },
        ].map(({ id, label, placeholder }) => (
          <div key={id} className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wide text-[#b5bac1]">{label}</Label>
            <Input
              {...register(id as keyof ProfileForm)}
              placeholder={placeholder}
              className="border-none bg-[#1e1f22] text-white placeholder:text-[#4e5058] focus-visible:ring-[#5865f2]"
            />
            {errors[id as keyof ProfileForm] && (
              <p className="text-xs text-[#ed4245]">{errors[id as keyof ProfileForm]?.message}</p>
            )}
          </div>
        ))}

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wide text-[#b5bac1]">About Me</Label>
            <span className="text-xs text-[#4e5058]">max 190 characters</span>
          </div>
          <Textarea
            {...register("bio")}
            rows={3}
            placeholder="Tell others a bit about yourself..."
            className="resize-none border-none bg-[#1e1f22] text-white placeholder:text-[#4e5058] focus-visible:ring-[#5865f2]"
          />
          {errors.bio && <p className="text-xs text-[#ed4245]">{errors.bio.message}</p>}
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

// ── Account tab ───────────────────────────────────────────────────────────────

function AccountTab({ user }: { user: IUser }) {
  const { logout } = useAuth();

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Account</h2>
        <p className="text-sm text-[#949ba4]">Manage your login and security settings.</p>
      </div>

      {[
        { label: "Email", value: user.email, verified: user.isEmailVerified },
        { label: "Phone Number", value: user.phoneNumber ?? "—", verified: user.isPhoneVerified },
      ].map(({ label, value, verified }) => (
        <div key={label} className="rounded-lg bg-[#2b2d31] p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-[#949ba4]">{label}</p>
              <p className="mt-0.5 truncate text-sm text-[#dbdee1]">{value}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className={cn("rounded-full px-2 py-0.5 text-xs",
                verified ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400")}>
                {verified ? "Verified" : "Unverified"}
              </span>
              <Button variant="outline" size="sm" className="border-[#4e5058] text-[#dbdee1] hover:bg-[#35363c]">
                Edit
              </Button>
            </div>
          </div>
        </div>
      ))}

      <Separator className="bg-[#3f4147]" />

      <div className="rounded-lg bg-[#2b2d31] p-4">
        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#949ba4]">Password</p>
        <p className="mb-3 text-sm text-[#949ba4]">Change your account password.</p>
        <Button variant="outline" size="sm" className="border-[#4e5058] text-[#dbdee1] hover:bg-[#35363c]">
          Change Password
        </Button>
      </div>

      <Separator className="bg-[#3f4147]" />

      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wide text-[#ed4245]">Danger Zone</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={logout} variant="outline" className="border-[#ed4245]/30 text-[#ed4245] hover:bg-[#ed4245]/10">
            Log Out
          </Button>
          <Button variant="destructive" className="border border-[#ed4245]/20 bg-[#ed4245]/10 text-[#ed4245] hover:bg-[#ed4245] hover:text-white">
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Placeholder tab ───────────────────────────────────────────────────────────

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
      <p className="text-lg font-semibold text-[#dbdee1]">{label}</p>
      <p className="text-sm text-[#4e5058]">Coming soon</p>
    </div>
  );
}

// ── Main settings page ────────────────────────────────────────────────────────

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();
  const { data } = useGetMeQuery();
  const storeUser = useAppSelector((s) => s.auth.user);
  const user = data?.data.user ?? storeUser;

  if (!user) return null;

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left nav */}
      <nav className="w-56 shrink-0 overflow-y-auto bg-[#2b2d31] px-2 py-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-4">
            <p className="mb-1 px-3 text-[11px] font-bold uppercase tracking-wide text-[#949ba4]">
              {section.title}
            </p>
            {section.items.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded px-3 py-1.5 text-sm transition-colors",
                  activeTab === id
                    ? "bg-[#404249] text-white"
                    : "text-[#949ba4] hover:bg-[#35363c] hover:text-[#dbdee1]",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>
        ))}

        <Separator className="my-2 bg-[#3f4147]" />

        <button
          onClick={() => navigate(-1)}
          className="flex w-full items-center gap-2 rounded px-3 py-1.5 text-sm text-[#949ba4] hover:bg-[#35363c] hover:text-[#dbdee1]"
        >
          <X className="h-4 w-4" />
          Close
        </button>
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-10 py-8">
        {activeTab === "profile" && <ProfileTab user={user} />}
        {activeTab === "account" && <AccountTab user={user} />}
        {activeTab === "privacy" && <PlaceholderTab label="Privacy & Safety" />}
        {activeTab === "appearance" && <PlaceholderTab label="Appearance" />}
        {activeTab === "notifications" && <PlaceholderTab label="Notifications" />}
      </main>
    </div>
  );
}