import { createContext, useContext } from "react";
import type { LucideIcon } from "lucide-react";

export interface ContextMenuItem {
    id: string;
    label: string;
    icon?: LucideIcon;
    danger?: boolean;
    disabled?: boolean;
    separator?: boolean;
    onClick: () => void;
}

interface ContextMenuContextValue {
    show: (x: number, y: number, items: ContextMenuItem[]) => void;
    hide: () => void;
}

export const ContextMenuContext = createContext<ContextMenuContextValue>({
    show: () => { },
    hide: () => { },
});

export function useContextMenu() {
    return useContext(ContextMenuContext);
}