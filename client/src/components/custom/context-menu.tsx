/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion, Menus, vp } from "@/utils/motion";
import { cn } from "@/utils/utils";
import { ContextMenuContext, useContextMenu, type ContextMenuItem } from "./context-menu-context";

export { ContextMenuContext, useContextMenu, type ContextMenuItem };

export function ContextMenuProvider({ children }: { children: React.ReactNode }) {
    const [menu, /* setMenu */] = useState<{ x: number; y: number; items: ContextMenuItem[] } | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const { show, hide } = useContextMenu();

    useEffect(() => {
        if (!menu) return;
        const onDown = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                hide();
            }
        };
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") hide(); };
        const onScroll = () => hide();

        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        window.addEventListener("scroll", onScroll, true);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
            window.removeEventListener("scroll", onScroll, true);
        };
    }, [menu, hide]);

    const getPosition = (x: number, y: number) => {
        const menuWidth = 200;
        const menuHeight = (menu?.items.length ?? 0) * 36 + 8;
        const clampedX = Math.min(x, window.innerWidth - menuWidth - 8);
        const clampedY = Math.min(y, window.innerHeight - menuHeight - 8);
        return { left: clampedX, top: clampedY };
    };

    return (
        <ContextMenuContext.Provider value={{ show, hide }}>
            {children}

            <AnimatePresence>
                {menu && (
                    <motion.div
                        ref={menuRef}
                        key="context-menu"
                        {...vp(Menus.contextMenu)}
                        style={getPosition(menu.x, menu.y)}
                        className="context-menu fixed z-[9998] min-w-[200px] overflow-hidden rounded-md border border-[#3f4147] bg-[#111214] py-1 shadow-2xl"
                    >
                        {menu.items.map((item) => (
                            <div key={item.id}>
                                {item.separator && (
                                    <div className="my-1 h-px bg-[#3f4147]" />
                                )}
                                <button
                                    onClick={() => {
                                        if (!item.disabled) {
                                            item.onClick();
                                            hide();
                                        }
                                    }}
                                    disabled={item.disabled}
                                    className={cn(
                                        "flex w-full items-center gap-2 px-3 py-[7px] text-sm transition-colors",
                                        item.disabled
                                            ? "cursor-not-allowed opacity-40 text-[#4e5058]"
                                            : item.danger
                                                ? "text-[#ed4245] hover:bg-[#ed4245] hover:text-white"
                                                : "text-[#dbdee1] hover:bg-[#5865f2] hover:text-white",
                                    )}
                                >
                                    {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                                    {item.label}
                                </button>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </ContextMenuContext.Provider>
    );
}

export default ContextMenuProvider;