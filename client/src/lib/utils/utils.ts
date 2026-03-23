import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ── Tailwind class merge ──────────────────────────────────────────────────────

/**
 * Merge Tailwind classes with clsx + tailwind-merge.
 * Resolves conflicts (e.g. `text-red-500 text-blue-500` → `text-blue-500`).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ── Avatar initials ───────────────────────────────────────────────────────────

/**
 * Derive 1–2 uppercase initials from a display name.
 * "John Doe" → "JD", "Alice" → "AL", "   " → "?"
 */
export function getInitials(name: string): string {
  const trimmed = name?.trim();
  if (!trimmed) return "?";
  const words = trimmed.split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

// ── Message timestamp ─────────────────────────────────────────────────────────

/**
 * Format a message timestamp for the chat view.
 *
 * - Today    → "2:34 PM"
 * - This week → "Mon 2:34 PM"
 * - Older    → "01/15/2024"
 */
export function formatMessageTime(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  if (diffDays < 7) {
    return date.toLocaleDateString([], {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString([], {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

// ── Relative time ─────────────────────────────────────────────────────────────

/**
 * Human-readable relative time string.
 * "just now", "5m ago", "2h ago", "3d ago", "Jan 15"
 */
export function relativeTime(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  const diffS = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffS < 30) return "just now";
  if (diffS < 60) return `${diffS}s ago`;

  const diffM = Math.floor(diffS / 60);
  if (diffM < 60) return `${diffM}m ago`;

  const diffH = Math.floor(diffM / 60);
  if (diffH < 24) return `${diffH}h ago`;

  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d ago`;

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ── File size ─────────────────────────────────────────────────────────────────

/**
 * Format raw bytes into a human-readable string.
 * 1024 → "1 KB", 1_500_000 → "1.4 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

// ── Truncate ──────────────────────────────────────────────────────────────────

/**
 * Truncate a string to `maxLength` chars, appending "…" if cut.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + "…";
}

// ── Plural ────────────────────────────────────────────────────────────────────

/**
 * Simple English pluraliser.
 * plural(1, "member") → "1 member"
 * plural(5, "member") → "5 members"
 */
export function plural(count: number, singular: string, pluralForm?: string): string {
  const word = count === 1 ? singular : (pluralForm ?? `${singular}s`);
  return `${count.toLocaleString()} ${word}`;
}

// ── Debounce (non-hook) ───────────────────────────────────────────────────────

/**
 * Returns a debounced version of `fn` that delays invocation by `ms`.
 * Use `useDebounce` hook for React components; this is for non-React usage.
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let id: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), ms);
  };
}

// ── URL helpers ───────────────────────────────────────────────────────────────

/** Check if a string is a valid URL */
export function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/** Generate an invite link from a code */
export function inviteLink(code: string): string {
  return `${window.location.origin}/invite/${code}`;
}