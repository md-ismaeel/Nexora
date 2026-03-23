import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, Modals, vp } from "@/lib/motion";
import { UIIcons, SidebarIcons, VoiceIcons } from "@/lib/lucide";
import { useCreateChannelMutation } from "@/api/channel_api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils/utils";
import { addToast } from "@/store/slices/ui_slice";
import { useAppDispatch } from "@/store/hooks";

const schema = z.object({
    name: z.string().min(1, "Channel name is required").max(100).regex(
        /^[a-z0-9-_]+$/,
        "Only lowercase letters, numbers, - and _ allowed",
    ),
    type: z.enum(["text", "voice"]),
    topic: z.string().max(1024).optional(),
    isPrivate: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
    onClose: () => void;
    serverId: string;
}

const CHANNEL_TYPES: { value: "text" | "voice"; label: string; desc: string; Icon: React.ElementType }[] = [
    {
        value: "text",
        label: "Text Channel",
        desc: "Send messages, images, GIFs, and more.",
        Icon: SidebarIcons.TextChannel,
    },
    {
        value: "voice",
        label: "Voice Channel",
        desc: "Hang out with voice, video, and screen share.",
        Icon: VoiceIcons.SpeakerOn,
    },
];

export function CreateChannelModal({ onClose, serverId }: Props) {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [createChannel, { isLoading }] = useCreateChannelMutation();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { name: "", type: "text", topic: "", isPrivate: false },
    });

    const selectedType = watch("type");
    const isPrivate = watch("isPrivate");

    const onSubmit = async (values: FormValues) => {
        try {
            const res = await createChannel({ serverId, ...values }).unwrap();
            const ch = res.data.channel;
            dispatch(addToast({ message: `#${ch.name} created!`, variant: "success" }));
            onClose();
            navigate(`/servers/${serverId}/${ch._id}`);
        } catch {
            dispatch(addToast({ message: "Failed to create channel.", variant: "error" }));
        }
    };

    return (
        <motion.div {...vp(Modals.dialog)} className="overflow-hidden rounded-xl bg-[#313338] shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-6">
                <div>
                    <h2 className="text-lg font-bold text-white">Create Channel</h2>
                    <p className="text-xs text-[#949ba4]">in this server</p>
                </div>
                <button
                    onClick={onClose}
                    className="rounded p-1 text-[#949ba4] transition-colors hover:text-white"
                >
                    <UIIcons.Close className="h-5 w-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-5">
                {/* Channel type picker */}
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wide text-[#b5bac1]">
                        Channel Type
                    </Label>
                    <div className="space-y-1.5">
                        {CHANNEL_TYPES.map(({ value, label, desc, Icon }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setValue("type", value)}
                                className={cn(
                                    "flex w-full items-center gap-4 rounded-lg border p-3 text-left transition-colors",
                                    selectedType === value
                                        ? "border-[#5865f2] bg-[#5865f2]/10"
                                        : "border-transparent bg-[#2b2d31] hover:border-[#5865f2]/30",
                                )}
                            >
                                <div className={cn(
                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                                    selectedType === value ? "bg-[#5865f2]/20 text-[#5865f2]" : "bg-[#1e1f22] text-[#949ba4]",
                                )}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className={cn("font-medium", selectedType === value ? "text-white" : "text-[#dbdee1]")}>
                                        {label}
                                    </p>
                                    <p className="text-xs text-[#949ba4]">{desc}</p>
                                </div>
                                {/* Radio indicator */}
                                <div className={cn(
                                    "ml-auto h-4 w-4 shrink-0 rounded-full border-2",
                                    selectedType === value ? "border-[#5865f2] bg-[#5865f2]" : "border-[#4e5058]",
                                )} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Channel name */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wide text-[#b5bac1]">
                        Channel Name <span className="text-[#ed4245]">*</span>
                    </Label>
                    <div className="relative">
                        {selectedType === "text" ? (
                            <SidebarIcons.TextChannel className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4e5058]" />
                        ) : (
                            <VoiceIcons.SpeakerOn className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4e5058]" />
                        )}
                        <Input
                            {...register("name")}
                            autoFocus
                            placeholder={selectedType === "text" ? "new-channel" : "General"}
                            className={cn(
                                "border-none bg-[#1e1f22] pl-9 text-white placeholder:text-[#4e5058] focus-visible:ring-2 focus-visible:ring-[#5865f2]",
                                errors.name && "ring-2 ring-[#ed4245]",
                            )}
                        />
                    </div>
                    {errors.name && (
                        <p className="text-xs text-[#ed4245]">{errors.name.message}</p>
                    )}
                </div>

                {/* Topic (text channels only) */}
                {selectedType === "text" && (
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wide text-[#b5bac1]">
                            Topic{" "}
                            <span className="text-[11px] font-normal lowercase text-[#4e5058]">(optional)</span>
                        </Label>
                        <Input
                            {...register("topic")}
                            placeholder="Let members know what this channel is about"
                            className="border-none bg-[#1e1f22] text-white placeholder:text-[#4e5058] focus-visible:ring-2 focus-visible:ring-[#5865f2]"
                        />
                    </div>
                )}

                {/* Private toggle */}
                <div className="flex items-center justify-between rounded-lg bg-[#2b2d31] p-4">
                    <div>
                        <p className="font-medium text-white">Private Channel</p>
                        <p className="mt-0.5 text-xs text-[#949ba4]">
                            Only selected roles can access this channel.
                        </p>
                    </div>
                    <Switch
                        checked={isPrivate}
                        onCheckedChange={(v) => setValue("isPrivate", v)}
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-1">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="text-[#949ba4] hover:text-white"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-[#5865f2] text-white hover:bg-[#4752c4] disabled:opacity-60"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Creating...
                            </span>
                        ) : (
                            "Create Channel"
                        )}
                    </Button>
                </div>
            </form>
        </motion.div>
    );
}