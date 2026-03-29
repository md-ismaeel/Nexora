// ─── motion/react re-exports you'll need in components 
export {
    motion,
    AnimatePresence,
    useAnimate,
    useMotionValue,
    useTransform,
    useSpring,
    useInView,
    useReducedMotion,
    LayoutGroup,
    Reorder,
} from "motion/react";

// ─── types only (no runtime cost)
import type {
    Variants,
    Transition,
    TargetAndTransition,
    MotionProps as MotionComponentProps,
} from "motion/react";


// §1 · EXPORTED TYPES

/** Re-exported for consumer convenience */
export type { Variants, Transition, TargetAndTransition };

/** Gesture object — spread onto any <motion.X> */
export interface GestureConfig {
    readonly whileHover: TargetAndTransition;
    readonly whileTap: TargetAndTransition;
    readonly transition?: Transition;
}

/** Ready-to-spread props built from a Variants map */
export interface VariantProps extends Pick<MotionComponentProps, "variants" | "initial" | "animate" | "exit"> {
    readonly variants: Variants;
    readonly initial: "hidden";
    readonly animate: "visible";
    readonly exit?: "exit";
}

/** Options for the makeStagger() helper */
export interface StaggerOptions {
    readonly staggerChildren?: number;
    readonly delayChildren?: number;
    readonly staggerDirection?: 1 | -1;
}



// §2 · BASE TRANSITIONS
const T = {
    /** Snappy spring — buttons, icon presses */
    spring: {
        type: "spring",
        stiffness: 420,
        damping: 30,
        mass: 0.9,
    } satisfies Transition,

    /** Gentle spring — panels, drawers, modals */
    softSpring: {
        type: "spring",
        stiffness: 260,
        damping: 26,
        mass: 1,
    } satisfies Transition,

    /** Bouncy spring — reactions, emoji, badges */
    bouncy: {
        type: "spring",
        stiffness: 520,
        damping: 18,
        mass: 0.75,
    } satisfies Transition,

    /** Inertia spring — drag-release feel */
    inertia: {
        type: "spring",
        stiffness: 180,
        damping: 20,
        mass: 1.2,
    } satisfies Transition,

    /** Smooth tween — overlays, tooltips */
    smooth: {
        type: "tween",
        ease: [0.25, 0.46, 0.45, 0.94],
        duration: 0.22,
    } satisfies Transition,

    /** Fast tween — instant hover feedback */
    fast: {
        type: "tween",
        ease: "easeOut",
        duration: 0.13,
    } satisfies Transition,

    /** Medium tween — toasts, banners */
    medium: {
        type: "tween",
        ease: [0.4, 0, 0.2, 1],
        duration: 0.28,
    } satisfies Transition,

    /** Slow tween — background / overlay fades */
    slow: {
        type: "tween",
        ease: "easeInOut",
        duration: 0.42,
    } satisfies Transition,
} as const;

/**
 * All base transitions — extend with spread operator:
 * @example
 *   transition={{ ...Transitions.spring, stiffness: 300 }}
 */
export const Transitions = T;


// §3 · UTILITY HELPERS

/**
 * Turn any Variants map into ready-to-spread props.
 * @example
 *   <motion.div {...vp(Modals.dialog)} />
 */
export function vp(variants: Variants, withExit = true): VariantProps {
    return {
        variants,
        initial: "hidden",
        animate: "visible",
        ...(withExit ? { exit: "exit" } : {}),
    };
}

/**
 * Build a stagger parent variant.
 * @example
 *   <motion.ul variants={makeStagger({ staggerChildren: 0.07 })}
 *     initial="hidden" animate="visible">
 */
export function makeStagger(opts: StaggerOptions = {}): Variants {
    const {
        staggerChildren = 0.055,
        delayChildren = 0.04,
        staggerDirection = 1,
    } = opts;
    return {
        hidden: {},
        visible: { transition: { staggerChildren, delayChildren, staggerDirection } },
        exit: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
    };
}

// §4 · PRIMITIVE VARIANTS  (generic, compose with these)
export const Primitives = {
    fade: {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: T.smooth },
        exit: { opacity: 0, transition: T.fast },
    } satisfies Variants,

    slideUp: {
        hidden: { opacity: 0, y: 14 },
        visible: { opacity: 1, y: 0, transition: T.softSpring },
        exit: { opacity: 0, y: 8, transition: T.fast },
    } satisfies Variants,

    slideDown: {
        hidden: { opacity: 0, y: -10, scaleY: 0.96 },
        visible: { opacity: 1, y: 0, scaleY: 1, transition: T.softSpring },
        exit: { opacity: 0, y: -7, scaleY: 0.96, transition: T.fast },
    } satisfies Variants,

    slideLeft: {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: T.softSpring },
        exit: { opacity: 0, x: -14, transition: T.fast },
    } satisfies Variants,

    slideRight: {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0, transition: T.softSpring },
        exit: { opacity: 0, x: 14, transition: T.fast },
    } satisfies Variants,

    scalePop: {
        hidden: { opacity: 0, scale: 0.88 },
        visible: { opacity: 1, scale: 1, transition: T.spring },
        exit: { opacity: 0, scale: 0.92, transition: T.fast },
    } satisfies Variants,

    /** Default stagger container — wrap lists in this */
    stagger: makeStagger(),
} as const;

// §5 · SIDEBAR
export const Sidebar = {
    /** Narrow server rail (72 px) */
    serverRail: {
        hidden: { x: -72, opacity: 0 },
        visible: { x: 0, opacity: 1, transition: T.softSpring },
        exit: { x: -72, opacity: 0, transition: T.smooth },
    } satisfies Variants,

    /** Channel panel (240 px) */
    channelPanel: {
        hidden: { x: -240, opacity: 0 },
        visible: { x: 0, opacity: 1, transition: T.softSpring },
        exit: { x: -240, opacity: 0, transition: T.smooth },
    } satisfies Variants,

    /** Right-side member list (240 px) */
    memberPanel: {
        hidden: { x: 240, opacity: 0 },
        visible: { x: 0, opacity: 1, transition: T.softSpring },
        exit: { x: 240, opacity: 0, transition: T.smooth },
    } satisfies Variants,

    /** Server icon in the rail */
    serverIcon: {
        hidden: { opacity: 0, scale: 0.65, x: -8 },
        visible: { opacity: 1, scale: 1, x: 0, transition: T.bouncy },
        exit: { opacity: 0, scale: 0.65, transition: T.fast },
    } satisfies Variants,

    /** Channel row */
    channelRow: {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0, transition: T.spring },
        exit: { opacity: 0, x: -6, transition: T.fast },
    } satisfies Variants,

    /** Category group label */
    categoryLabel: {
        hidden: { opacity: 0, y: -6 },
        visible: { opacity: 1, y: 0, transition: T.smooth },
        exit: { opacity: 0, transition: T.fast },
    } satisfies Variants,

    // ── Gestures ──
    serverIconGesture: {
        whileHover: { scale: 1.12, borderRadius: "30%", transition: T.spring },
        whileTap: { scale: 0.92, transition: T.spring },
    } satisfies GestureConfig,

    channelRowGesture: {
        whileHover: { x: 2, transition: T.fast },
        whileTap: { scale: 0.98, transition: T.fast },
    } satisfies GestureConfig,
} as const;



// §6 · MESSAGES
export const Messages = {
    /** New message in chat */
    item: {
        hidden: { opacity: 0, y: 10, scale: 0.98 },
        visible: {
            opacity: 1, y: 0, scale: 1,
            transition: { ...T.spring, stiffness: 350, damping: 27 },
        },
        exit: { opacity: 0, scale: 0.96, transition: T.fast },
    } satisfies Variants,

    /** Message from another user */
    incoming: {
        hidden: { opacity: 0, x: -12, scale: 0.97 },
        visible: { opacity: 1, x: 0, scale: 1, transition: T.softSpring },
        exit: { opacity: 0, x: -8, transition: T.fast },
    } satisfies Variants,

    /** Message from current user */
    outgoing: {
        hidden: { opacity: 0, x: 12, scale: 0.97 },
        visible: { opacity: 1, x: 0, scale: 1, transition: T.softSpring },
        exit: { opacity: 0, x: 8, transition: T.fast },
    } satisfies Variants,

    /** Hover action bar (react / reply / more) */
    actionBar: {
        hidden: { opacity: 0, scale: 0.86, y: 5 },
        visible: { opacity: 1, scale: 1, y: 0, transition: T.spring },
        exit: { opacity: 0, scale: 0.88, y: 3, transition: T.fast },
    } satisfies Variants,

    /** Reply thread / inline preview */
    replyPreview: {
        hidden: { opacity: 0, height: 0, scaleY: 0.95 },
        visible: {
            opacity: 1, height: "auto", scaleY: 1,
            transition: { ...T.softSpring, stiffness: 280 },
        },
        exit: { opacity: 0, height: 0, scaleY: 0.95, transition: T.smooth },
    } satisfies Variants,

    /** Typing bubble wrapper */
    typingWrapper: {
        hidden: { opacity: 0, y: 4 },
        visible: { opacity: 1, y: 0, transition: T.smooth },
        exit: { opacity: 0, y: 4, transition: T.fast },
    } satisfies Variants,

    /**
     * Single typing dot — pass dot index via `custom` prop.
     * @example
     *   {[0,1,2].map(i => (
     *     <motion.span key={i} custom={i}
     *       variants={Messages.typingDot} animate="animate" />
     *   ))}
     */
    typingDot: {
        animate: (i: number) => ({
            y: [0, -6, 0],
            transition: {
                repeat: Infinity,
                duration: 0.72,
                ease: "easeInOut",
                delay: i * 0.15,
            },
        }),
    } satisfies Variants,

    /** "NEW MESSAGES" divider bar */
    unreadDivider: {
        hidden: { opacity: 0, scaleX: 0.6, originX: 0 },
        visible: {
            opacity: 1, scaleX: 1, originX: 0,
            transition: { ...T.softSpring, duration: 0.38 },
        },
        exit: { opacity: 0, transition: T.fast },
    } satisfies Variants,

    // ── Gestures ──
    actionIconGesture: {
        whileHover: { scale: 1.18, rotate: 6, transition: T.spring },
        whileTap: { scale: 0.88, transition: T.spring },
    } satisfies GestureConfig,
} as const;


// §7 · REACTIONS & EMOJI
export const Reactions = {
    /** Reaction pill on a message */
    pill: {
        hidden: { opacity: 0, scale: 0.45 },
        visible: { opacity: 1, scale: 1, transition: T.bouncy },
        exit: { opacity: 0, scale: 0.45, transition: T.fast },
    } satisfies Variants,

    /** "+1" count burst that floats up */
    countBurst: {
        initial: { opacity: 1, y: 0, scale: 1 },
        animate: {
            opacity: 0, y: -22, scale: 1.35,
            transition: { duration: 0.55, ease: "easeOut" },
        },
    } satisfies Variants,

    /** Emoji picker floating panel */
    picker: {
        hidden: { opacity: 0, scale: 0.88, y: 10 },
        visible: { opacity: 1, scale: 1, y: 0, transition: T.spring },
        exit: { opacity: 0, scale: 0.88, y: 7, transition: T.fast },
    } satisfies Variants,

    /** Individual emoji cell in the picker grid */
    emojiCell: {
        hidden: { opacity: 0, scale: 0.55 },
        visible: { opacity: 1, scale: 1, transition: T.bouncy },
        exit: { opacity: 0, scale: 0.55, transition: T.fast },
    } satisfies Variants,

    // ── Gestures ──
    pillGesture: {
        whileHover: { scale: 1.22, y: -3, transition: T.bouncy },
        whileTap: { scale: 0.9, transition: T.spring },
    } satisfies GestureConfig,

    emojiCellGesture: {
        whileHover: { scale: 1.3, rotate: 8, transition: T.bouncy },
        whileTap: { scale: 0.9, transition: T.spring },
    } satisfies GestureConfig,
} as const;



// §8 · MODALS & OVERLAYS
export const Modals = {
    /** Dark dimmed backdrop */
    backdrop: {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2, ease: "easeOut" } },
        exit: { opacity: 0, transition: { duration: 0.16, ease: "easeIn" } },
    } satisfies Variants,

    /** Standard dialog */
    dialog: {
        hidden: { opacity: 0, scale: 0.88, y: 22 },
        visible: { opacity: 1, scale: 1, y: 0, transition: T.spring },
        exit: { opacity: 0, scale: 0.92, y: 14, transition: T.smooth },
    } satisfies Variants,

    /** Full-screen settings overlay */
    settings: {
        hidden: { opacity: 0, scale: 0.96 },
        visible: { opacity: 1, scale: 1, transition: T.softSpring },
        exit: { opacity: 0, scale: 0.96, transition: T.smooth },
    } satisfies Variants,

    /** Mobile bottom sheet */
    bottomSheet: {
        hidden: { opacity: 0, y: "100%" },
        visible: { opacity: 1, y: "0%", transition: T.softSpring },
        exit: { opacity: 0, y: "100%", transition: T.smooth },
    } satisfies Variants,

    /** Inbox / side drawer */
    sideSheet: {
        hidden: { opacity: 0, x: "100%" },
        visible: { opacity: 1, x: "0%", transition: T.softSpring },
        exit: { opacity: 0, x: "100%", transition: T.smooth },
    } satisfies Variants,
} as const;



// §9 · MENUS & TOOLTIPS
export const Menus = {
    /** Right-click context menu */
    contextMenu: {
        hidden: { opacity: 0, scale: 0.93, y: -5 },
        visible: { opacity: 1, scale: 1, y: 0, transition: T.spring },
        exit: { opacity: 0, scale: 0.93, transition: T.fast },
    } satisfies Variants,

    /** Dropdown (sort / filter / etc.) */
    dropdown: {
        hidden: { opacity: 0, scaleY: 0.92, y: -6, originY: 0 },
        visible: { opacity: 1, scaleY: 1, y: 0, originY: 0, transition: T.spring },
        exit: { opacity: 0, scaleY: 0.92, y: -4, originY: 0, transition: T.fast },
    } satisfies Variants,

    /** Individual menu item row */
    menuItem: {
        hidden: { opacity: 0, x: -6 },
        visible: { opacity: 1, x: 0, transition: T.spring },
        exit: { opacity: 0, transition: T.fast },
    } satisfies Variants,

    /** Tooltip bubble */
    tooltip: {
        hidden: { opacity: 0, scale: 0.84 },
        visible: { opacity: 1, scale: 1, transition: T.fast },
        exit: { opacity: 0, scale: 0.84, transition: T.fast },
    } satisfies Variants,

    /** Nested sub-menu */
    subMenu: {
        hidden: { opacity: 0, x: 10 },
        visible: { opacity: 1, x: 0, transition: T.softSpring },
        exit: { opacity: 0, x: 8, transition: T.fast },
    } satisfies Variants,

    // ── Gestures ──
    menuItemGesture: {
        whileHover: { x: 3, backgroundColor: "rgba(255,255,255,0.06)", transition: T.fast },
        whileTap: { scale: 0.97, transition: T.fast },
    } satisfies GestureConfig,
} as const;


// §10 · VOICE & VIDEO
export const Voice = {
    /** VC user tile */
    tile: {
        hidden: { opacity: 0, scale: 0.82 },
        visible: { opacity: 1, scale: 1, transition: T.spring },
        exit: { opacity: 0, scale: 0.86, transition: T.smooth },
    } satisfies Variants,

    /**
     * Speaking glow ring
     * @example  animate={isSpeaking ? "active" : "idle"}
     */
    speakingRing: {
        idle: { scale: 1, opacity: 0 },
        active: {
            scale: [1, 1.1, 1.05, 1],
            opacity: [0, 0.75, 0.5, 0],
            transition: { repeat: Infinity, duration: 1.15, ease: "easeInOut" },
        },
    } satisfies Variants,

    /** Screen-share preview */
    screenshare: {
        hidden: { opacity: 0, scale: 0.9, y: 12 },
        visible: { opacity: 1, scale: 1, y: 0, transition: T.spring },
        exit: { opacity: 0, scale: 0.92, transition: T.smooth },
    } satisfies Variants,

    /** Mute icon swap animation */
    muteIcon: {
        hidden: { opacity: 0, rotate: -20, scale: 0.7 },
        visible: { opacity: 1, rotate: 0, scale: 1, transition: T.bouncy },
        exit: { opacity: 0, rotate: 20, scale: 0.7, transition: T.fast },
    } satisfies Variants,

    // ── Gestures ──
    controlGesture: {
        whileHover: { scale: 1.12, transition: T.spring },
        whileTap: { scale: 0.9, transition: T.spring },
    } satisfies GestureConfig,
} as const;



// §11 · NOTIFICATIONS & TOASTS
export const Notifications = {
    /** Bottom-right toast */
    toast: {
        hidden: { opacity: 0, y: 48, scale: 0.88 },
        visible: { opacity: 1, y: 0, scale: 1, transition: T.spring },
        exit: { opacity: 0, y: 30, scale: 0.92, transition: T.medium },
    } satisfies Variants,

    /** Mention / unread count badge */
    badge: {
        hidden: { opacity: 0, scale: 0 },
        visible: { opacity: 1, scale: 1, transition: T.bouncy },
        exit: { opacity: 0, scale: 0, transition: T.fast },
    } satisfies Variants,

    /** Incoming DM top banner */
    dmBanner: {
        hidden: { opacity: 0, x: 90 },
        visible: { opacity: 1, x: 0, transition: T.spring },
        exit: { opacity: 0, x: 90, transition: T.smooth },
    } satisfies Variants,

    /** Ping ripple emanating from avatar */
    pingRipple: {
        initial: { scale: 1, opacity: 0.6 },
        animate: {
            scale: 2.2, opacity: 0,
            transition: { duration: 0.65, ease: "easeOut" },
        },
    } satisfies Variants,
} as const;



// §12 · USER PROFILE
export const Profile = {
    /** Hover popover card */
    card: {
        hidden: { opacity: 0, scale: 0.9, y: 8 },
        visible: { opacity: 1, scale: 1, y: 0, transition: T.spring },
        exit: { opacity: 0, scale: 0.9, y: 5, transition: T.fast },
    } satisfies Variants,

    /** Full profile page */
    page: {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: T.softSpring },
        exit: { opacity: 0, y: 12, transition: T.smooth },
    } satisfies Variants,

    /**
     * Status indicator dot
     * @example  animate={userStatus}  // "online" | "idle" | "dnd" | "offline"
     */
    statusDot: {
        online: { scale: 1, opacity: 1, transition: T.spring },
        idle: { scale: 0.9, opacity: 0.85, transition: T.smooth },
        dnd: { scale: 1, opacity: 1, transition: T.spring },
        offline: { scale: 0.75, opacity: 0.45, transition: T.smooth },
    } satisfies Variants,

    /**
     * Avatar border pulse while speaking
     * @example  animate={isSpeaking ? "speaking" : "idle"}
     */
    avatarSpeak: {
        idle: { boxShadow: "0 0 0 0px rgba(67,181,129,0)" },
        speaking: {
            boxShadow: [
                "0 0 0 0px  rgba(67,181,129,0)",
                "0 0 0 3px  rgba(67,181,129,0.75)",
                "0 0 0 0px  rgba(67,181,129,0)",
            ],
            transition: { repeat: Infinity, duration: 1.1, ease: "easeInOut" },
        },
    } satisfies Variants,

    // ── Gestures ──
    avatarGesture: {
        whileHover: { scale: 1.06, transition: T.spring },
        whileTap: { scale: 0.94, transition: T.spring },
    } satisfies GestureConfig,
} as const;



// §13 · ATTACHMENTS & UPLOADS
export const Uploads = {
    /** File / image preview card */
    card: {
        hidden: { opacity: 0, scale: 0.88, y: 10 },
        visible: { opacity: 1, scale: 1, y: 0, transition: T.spring },
        exit: { opacity: 0, scale: 0.88, transition: T.fast },
    } satisfies Variants,

    /** Progress fill bar (scaleX 0 → 1) */
    progressBar: {
        hidden: { scaleX: 0, originX: 0 },
        visible: {
            scaleX: 1, originX: 0,
            transition: { ...T.smooth, duration: 1.4, ease: [0.22, 1, 0.36, 1] },
        },
    } satisfies Variants,

    /** Drag-over zone */
    dropZone: {
        inactive: { opacity: 0, scale: 0.98 },
        active: { opacity: 1, scale: 1, transition: T.spring },
    } satisfies Variants,

    // ── Gestures ──
    removeGesture: {
        whileHover: { scale: 1.2, rotate: 90, transition: T.spring },
        whileTap: { scale: 0.85, transition: T.spring },
    } satisfies GestureConfig,
} as const;



// §14 · SEARCH & COMMANDS
export const Search = {
    /** Quick-switcher / search panel */
    panel: {
        hidden: { opacity: 0, y: -12, scale: 0.97 },
        visible: { opacity: 1, y: 0, scale: 1, transition: T.spring },
        exit: { opacity: 0, y: -8, scale: 0.97, transition: T.fast },
    } satisfies Variants,

    /** Individual search result row */
    resultRow: {
        hidden: { opacity: 0, x: -8 },
        visible: { opacity: 1, x: 0, transition: T.spring },
        exit: { opacity: 0, x: -6, transition: T.fast },
    } satisfies Variants,

    /** Slash-command autocomplete list */
    commandList: {
        hidden: { opacity: 0, y: 8, scale: 0.96 },
        visible: { opacity: 1, y: 0, scale: 1, transition: T.spring },
        exit: { opacity: 0, y: 5, scale: 0.96, transition: T.fast },
    } satisfies Variants,

    /** Slash-command row */
    commandRow: {
        hidden: { opacity: 0, x: -6 },
        visible: { opacity: 1, x: 0, transition: T.spring },
        exit: { opacity: 0, transition: T.fast },
    } satisfies Variants,
} as const;



// §15 · MISC / DISCORD-SPECIFIC
export const Misc = {
    /** Server discovery card */
    discoveryCard: {
        hidden: { opacity: 0, y: 22 },
        visible: { opacity: 1, y: 0, transition: T.softSpring },
        exit: { opacity: 0, y: 14, transition: T.fast },
    } satisfies Variants,

    /** Nitro boost burst */
    nitroFlash: {
        initial: { scale: 1, opacity: 1 },
        animate: {
            scale: [1, 1.55, 1],
            opacity: [1, 0.55, 1],
            transition: { duration: 0.48, ease: "easeOut" },
        },
    } satisfies Variants,

    /** Thread / forum post card */
    threadCard: {
        hidden: { opacity: 0, y: 14, scale: 0.97 },
        visible: { opacity: 1, y: 0, scale: 1, transition: T.softSpring },
        exit: { opacity: 0, y: 8, transition: T.fast },
    } satisfies Variants,

    /** Stage / announcement banner */
    stageBanner: {
        hidden: { opacity: 0, y: -16 },
        visible: { opacity: 1, y: 0, transition: T.softSpring },
        exit: { opacity: 0, y: -12, transition: T.smooth },
    } satisfies Variants,

    /** Route / page transition */
    pageTransition: {
        hidden: { opacity: 0, x: 10 },
        visible: { opacity: 1, x: 0, transition: T.softSpring },
        exit: { opacity: 0, x: -8, transition: T.smooth },
    } satisfies Variants,

    // ── Gestures ──
    iconButtonGesture: {
        whileHover: { scale: 1.15, transition: T.spring },
        whileTap: { scale: 0.88, transition: T.spring },
    } satisfies GestureConfig,

    ctaButtonGesture: {
        whileHover: { scale: 1.04, filter: "brightness(1.1)", transition: T.spring },
        whileTap: { scale: 0.96, filter: "brightness(0.9)", transition: T.spring },
    } satisfies GestureConfig,

    listItemGesture: {
        whileHover: { backgroundColor: "rgba(255,255,255,0.04)", transition: T.fast },
        whileTap: { scale: 0.99, transition: T.fast },
    } satisfies GestureConfig,
} as const;



// DEFAULT EXPORT
const discord = {
    Transitions,
    Primitives,
    Sidebar,
    Messages,
    Reactions,
    Modals,
    Menus,
    Voice,
    Notifications,
    Profile,
    Uploads,
    Search,
    Misc,
    vp,
    makeStagger,
} as const;

export default discord;


/*
═══════════════════════════════════════════════════════════════════════
QUICK REFERENCE
═══════════════════════════════════════════════════════════════════════

INSTALL
  npm install motion

IMPORT MOTION ITSELF  (from this file — no second import needed)
  import { motion, AnimatePresence } from "./motionConfig"

VARIANTS — two styles:

  A) Spread helper (cleanest):
     import { motion, Messages, vp } from "./motionConfig"
     <motion.div {...vp(Messages.item)} />

  B) Explicit:
     <motion.div
       variants={Messages.item}
       initial="hidden" animate="visible" exit="exit"
     />

GESTURE CONFIG — spread alongside variants:
  <motion.button
    {...vp(Sidebar.serverIcon)}
    {...Sidebar.serverIconGesture}
  />

TYPING DOTS — custom prop drives per-dot delay:
  {[0, 1, 2].map((i) => (
    <motion.span
      key={i}
      custom={i}
      variants={Messages.typingDot}
      animate="animate"
    />
  ))}

STATE-DRIVEN VARIANTS — no initial/animate strings needed:
  <motion.div variants={Profile.statusDot} animate={user.status} />
  <motion.div variants={Voice.speakingRing} animate={isSpeaking ? "active" : "idle"} />

STAGGER LIST:
  <motion.ul variants={makeStagger({ staggerChildren: 0.07 })}
    initial="hidden" animate="visible">
    {items.map(i => <motion.li key={i.id} variants={Primitives.slideUp} />)}
  </motion.ul>

WRAPPED WITH AnimatePresence (for exit animations):
  <AnimatePresence>
    {isOpen && <motion.div {...vp(Modals.dialog)} key="modal" />}
  </AnimatePresence>

CUSTOM TRANSITION:
  transition={{ ...Transitions.spring, stiffness: 300, damping: 20 }}

═══════════════════════════════════════════════════════════════════════
*/