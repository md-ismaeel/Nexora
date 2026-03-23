import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, Modals, vp } from "@/lib/motion";
import { UIIcons, ServerIcons } from "@/lib/lucide";
import { useCreateServerMutation } from "@/api/server_api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils/utils";
import { addToast } from "@/store/slices/ui_slice";
import { useAppDispatch } from "@/store/hooks";

const schema = z.object({
    name: z.string().min(2, "At least 2 characters").max(100, "Max 100 characters"),
    description: z.string().max(500).optional(),
    isPublic: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
    onClose: () => void;
}

export function CreateServerModal({ onClose }: Props) {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [createServer, { isLoading }] = useCreateServerMutation();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { name: "", description: "", isPublic: false },
    });

    const isPublic = watch("isPublic");

    const onSubmit = async (values: FormValues) => {
        try {
            const res = await createServer(values).unwrap();
            const server = res.data.server;
            dispatch(addToast({ message: `${server.name} created!`, variant: "success" }));
            onClose();
            // Navigate to the new server — ServerPage will auto-redirect to first channel
            navigate(`/servers/${server._id}`);
        } catch {
            dispatch(addToast({ message: "Failed to create server.", variant: "error" }));
        }
    };

    return (
        <motion.div {...vp(Modals.dialog)} className="overflow-hidden rounded-xl bg-[#313338] shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5865f2]/10">
                        <ServerIcons.ServerSettings className="h-5 w-5 text-[#5865f2]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Create a Server</h2>
                        <p className="text-xs text-[#949ba4]">Give your community a home.</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="rounded p-1 text-[#949ba4] transition-colors hover:text-white"
                >
                    <UIIcons.Close className="h-5 w-5" />
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
                {/* Name */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wide text-[#b5bac1]">
                        Server Name <span className="text-[#ed4245]">*</span>
                    </Label>
                    <Input
                        {...register("name")}
                        autoFocus
                        placeholder="My Awesome Server"
                        className={cn(
                            "border-none bg-[#1e1f22] text-white placeholder:text-[#4e5058] focus-visible:ring-2 focus-visible:ring-[#5865f2]",
                            errors.name && "ring-2 ring-[#ed4245]",
                        )}
                    />
                    {errors.name && (
                        <p className="text-xs text-[#ed4245]">{errors.name.message}</p>
                    )}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wide text-[#b5bac1]">
                        Description{" "}
                        <span className="text-[11px] font-normal lowercase text-[#4e5058]">(optional)</span>
                    </Label>
                    <Input
                        {...register("description")}
                        placeholder="What's this server about?"
                        className="border-none bg-[#1e1f22] text-white placeholder:text-[#4e5058] focus-visible:ring-2 focus-visible:ring-[#5865f2]"
                    />
                </div>

                {/* Public toggle */}
                <div className="flex items-center justify-between rounded-lg bg-[#2b2d31] p-4">
                    <div className="min-w-0">
                        <p className="font-medium text-white">Public Server</p>
                        <p className="mt-0.5 text-xs text-[#949ba4]">
                            Anyone can join via Discover or invite link.
                        </p>
                    </div>
                    <Switch
                        checked={isPublic}
                        onCheckedChange={(v) => setValue("isPublic", v)}
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
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
                            "Create Server"
                        )}
                    </Button>
                </div>
            </form>
        </motion.div>
    );
}