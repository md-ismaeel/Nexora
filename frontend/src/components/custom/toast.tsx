import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { removeToast, type ToastVariant } from "@/store/slices/ui_slice";
import { motion, AnimatePresence, Notifications } from "@/lib/motion";
import { UIIcons } from "@/lib/lucide";
import { cn } from "@/lib/utils/utils";

// ── Icon + colour per variant ─────────────────────────────────────────────────

const VARIANTS: Record<
    ToastVariant,
    { icon: React.ElementType; classes: string }
> = {
    success: {
        icon: UIIcons.Success,
        classes: "border-green-500/20 bg-[#2b2d31] text-green-400",
    },
    error: {
        icon: UIIcons.Error,
        classes: "border-[#ed4245]/20 bg-[#2b2d31] text-[#ed4245]",
    },
    warning: {
        icon: UIIcons.Warning,
        classes: "border-yellow-500/20 bg-[#2b2d31] text-yellow-400",
    },
    info: {
        icon: UIIcons.Info,
        classes: "border-[#5865f2]/20 bg-[#2b2d31] text-[#5865f2]",
    },
};

// ── Single toast item ─────────────────────────────────────────────────────────

function ToastItem({
    id,
    message,
    variant,
    duration = 4000,
}: {
    id: string;
    message: string;
    variant: ToastVariant;
    duration?: number;
}) {
    const dispatch = useAppDispatch();
    const { icon: Icon, classes } = VARIANTS[variant];

    useEffect(() => {
        const timer = setTimeout(() => dispatch(removeToast(id)), duration);
        return () => clearTimeout(timer);
    }, [id, duration, dispatch]);

    return (
        <motion.div
            layout
            variants={Notifications.toast}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
                "flex w-80 items-center gap-3 rounded-lg border px-4 py-3 shadow-xl",
                classes,
            )}
        >
            <Icon className="h-4 w-4 shrink-0" />
            <p className="flex-1 text-sm font-medium text-[#dbdee1]">{message}</p>
            <button
                onClick={() => dispatch(removeToast(id))}
                className="shrink-0 text-[#949ba4] hover:text-white"
            >
                <UIIcons.Close className="h-3.5 w-3.5" />
            </button>
        </motion.div>
    );
}

// ── Container ─────────────────────────────────────────────────────────────────

/**
 * ToastContainer — render once at the root of the app (inside App.tsx).
 * It reads from ui.toasts and renders each toast with enter/exit animation.
 *
 * @example
 *   // App.tsx
 *   <ToastContainer />
 *   <RouterProvider router={router} />
 */
export function ToastContainer() {
    const toasts = useAppSelector((s) => s.ui.toasts);

    return (
        <div className="pointer-events-none fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2">
            <AnimatePresence mode="popLayout">
                {toasts.map((t) => (
                    <div key={t.id} className="pointer-events-auto">
                        <ToastItem {...t} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
}