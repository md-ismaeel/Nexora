// ─── Re-export every valid lucide icon (no manual aliasing = no conflicts) ──
export * from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
import type { CSSProperties } from "react";
import type { LucideIcon, LucideProps } from "lucide-react";

export type { LucideIcon, LucideProps };

/** Any lucide icon component */
export type Icon = LucideIcon;

/** Props accepted by every icon */
export interface IconProps {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  className?: string;
  style?: CSSProperties;
}

/** A named icon map — useful for dynamic rendering */
export type IconMap = Record<string, LucideIcon>;

// ─── Private imports (prefixed with _ to avoid re-export conflicts) ──────────
import {
  // Navigation
  Hash as _Hash,
  Home as _Home,
  Compass as _Compass,
  Bell as _Bell,
  BellOff as _BellOff,
  BellRing as _BellRing,
  Inbox as _Inbox,
  Mail as _Mail,
  MailOpen as _MailOpen,
  Search as _Search,
  Settings as _Settings,
  Settings2 as _Settings2,
  Menu as _Menu,
  LayoutGrid as _LayoutGrid,
  PanelLeft as _PanelLeft,
  PanelRight as _PanelRight,
  ChevronDown as _ChevronDown,
  ChevronRight as _ChevronRight,
  ChevronLeft as _ChevronLeft,
  ChevronUp as _ChevronUp,
  ChevronsUpDown as _ChevronsUpDown,
  ArrowLeft as _ArrowLeft,
  ArrowRight as _ArrowRight,
  X as _X,
  Plus as _Plus,
  Minus as _Minus,
  Check as _Check,
  MoreHorizontal as _MoreHorizontal,
  MoreVertical as _MoreVertical,
  ExternalLink as _ExternalLink,
  Link as _Link,
  Link2 as _Link2,

  // Server & Channel
  Server as _Server,
  Globe as _Globe,
  Lock as _Lock,
  Unlock as _Unlock,
  Eye as _Eye,
  EyeOff as _EyeOff,
  Radio as _Radio,
  Megaphone as _Megaphone,
  BookOpen as _BookOpen,
  Bookmark as _Bookmark,
  Star as _Star,
  Flag as _Flag,
  Flame as _Flame,
  Crown as _Crown,
  Sparkles as _Sparkles,
  Zap as _Zap,
  ZapOff as _ZapOff,
  Pin as _Pin,
  PinOff as _PinOff,
  Folder as _Folder,
  FolderOpen as _FolderOpen,

  // Messaging
  MessageCircle as _MessageCircle,
  MessageCircleMore as _MessageCircleMore,
  MessageSquare as _MessageSquare,
  MessageSquarePlus as _MessageSquarePlus,
  MessageSquareMore as _MessageSquareMore,
  MessageSquareReply as _MessageSquareReply,
  Send as _Send,
  SendHorizontal as _SendHorizontal,
  Reply as _Reply,
  ReplyAll as _ReplyAll,
  Forward as _Forward,
  AtSign as _AtSign,
  Smile as _Smile,
  SmilePlus as _SmilePlus,
  Laugh as _Laugh,
  Frown as _Frown,
  Meh as _Meh,
  Heart as _Heart,
  ThumbsUp as _ThumbsUp,
  ThumbsDown as _ThumbsDown,
  Sticker as _Sticker,
  PartyPopper as _PartyPopper,
  Ghost as _Ghost,
  Skull as _Skull,
  Bold as _Bold,
  Italic as _Italic,
  Underline as _Underline,
  Strikethrough as _Strikethrough,
  Code as _Code,
  Code2 as _Code2,
  Quote as _Quote,

  // Voice & Video
  Mic as _Mic,
  MicOff as _MicOff,
  Volume2 as _Volume2,
  VolumeX as _VolumeX,
  VolumeOff as _VolumeOff,
  Headphones as _Headphones,
  Video as _Video,
  VideoOff as _VideoOff,
  Camera as _Camera,
  CameraOff as _CameraOff,
  Monitor as _Monitor,
  MonitorOff as _MonitorOff,
  ScreenShare as _ScreenShare,
  ScreenShareOff as _ScreenShareOff,
  Phone as _Phone,
  PhoneOff as _PhoneOff,
  PhoneCall as _PhoneCall,
  PhoneMissed as _PhoneMissed,
  Hand as _Hand,
  Cast as _Cast,

  // Users & Profile
  User as _User,
  UserPlus as _UserPlus,
  UserMinus as _UserMinus,
  UserX as _UserX,
  UserCheck as _UserCheck,
  UserCog as _UserCog,
  Users as _Users,
  UsersRound as _UsersRound,
  BadgeCheck as _BadgeCheck,
  Shield as _Shield,
  ShieldCheck as _ShieldCheck,
  ShieldAlert as _ShieldAlert,
  ShieldOff as _ShieldOff,
  Award as _Award,
  CircleUser as _CircleUser,
  Contact as _Contact,

  // Status & Presence
  Circle as _Circle,
  CircleDot as _CircleDot,
  CircleOff as _CircleOff,
  CircleCheck as _CircleCheck,
  CircleX as _CircleX,
  CircleMinus as _CircleMinus,
  Loader2 as _Loader2,
  RefreshCw as _RefreshCw,
  Activity as _Activity,
  Wifi as _Wifi,
  WifiOff as _WifiOff,
  Signal as _Signal,

  // Files & Media
  File as _File,
  FileText as _FileText,
  FileImage as _FileImage,
  FileCode as _FileCode,
  FilePlus as _FilePlus,
  FileX as _FileX,
  FileCheck as _FileCheck,
  Image as _Image,
  ImagePlus as _ImagePlus,
  ImageOff as _ImageOff,
  Images as _Images,
  Film as _Film,
  Music2 as _Music2,
  Paperclip as _Paperclip,
  Download as _Download,
  Upload as _Upload,
  Cloud as _Cloud,
  CloudOff as _CloudOff,
  Clipboard as _Clipboard,

  // Actions
  Pencil as _Pencil,
  PenLine as _PenLine,
  Trash2 as _Trash2,
  Copy as _Copy,
  Share2 as _Share2,
  Save as _Save,
  Undo2 as _Undo2,
  Redo2 as _Redo2,
  ZoomIn as _ZoomIn,
  ZoomOut as _ZoomOut,
  Maximize2 as _Maximize2,
  Minimize2 as _Minimize2,
  Move as _Move,
  GripVertical as _GripVertical,
  Scissors as _Scissors,

  // Moderation & Safety
  Ban as _Ban,
  AlertCircle as _AlertCircle,
  AlertTriangle as _AlertTriangle,
  Info as _Info,
  HelpCircle as _HelpCircle,
  TriangleAlert as _TriangleAlert,
  CircleAlert as _CircleAlert,
  CircleHelp as _CircleHelp,
  Hammer as _Hammer,
  Gavel as _Gavel,
  Scale as _Scale,
  OctagonAlert as _OctagonAlert,

  // Nitro & Premium
  Diamond as _Diamond,
  Gem as _Gem,
  Rocket as _Rocket,
  Gift as _Gift,

  // Settings
  Sliders as _Sliders,
  SlidersHorizontal as _SlidersHorizontal,
  ToggleLeft as _ToggleLeft,
  ToggleRight as _ToggleRight,
  Wrench as _Wrench,
  Key as _Key,
  LogIn as _LogIn,
  LogOut as _LogOut,
  Power as _Power,

  // Misc
  Clock as _Clock,
  Timer as _Timer,
  Calendar as _Calendar,
  MapPin as _MapPin,
  Tag as _Tag,
  Sun as _Sun,
  Moon as _Moon,
  Podcast as _Podcast,
  Voicemail as _Voicemail,
} from "lucide-react";


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §1 · SIDEBAR ICONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SidebarIcons = {
  // Server rail
  Home: _Home,
  Discover: _Compass,
  AddServer: _Plus,
  DirectMessages: _MessageCircle,
  Notifications: _Bell,
  Inbox: _Inbox,
  Settings: _Settings,

  // Channel panel header
  ServerMenu: _ChevronDown,
  CollapseLeft: _PanelLeft,
  ExpandRight: _PanelRight,
  Search: _Search,
  NewChannel: _Plus,

  // Channel types
  TextChannel: _Hash,
  VoiceChannel: _Volume2,
  AnnouncementChannel: _Megaphone,
  StageChannel: _Radio,
  ForumChannel: _MessageSquare,
  ThreadChannel: _MessageSquareReply,
  MediaChannel: _Image,
  LockedChannel: _Lock,

  // Category
  CategoryExpand: _ChevronDown,
  CategoryCollapse: _ChevronRight,
  AddToCategory: _Plus,

  // Member list
  MemberList: _UsersRound,
  OnlineDot: _CircleDot,
  OfflineDot: _Circle,

  // Misc
  Folder: _Folder,
  FolderOpen: _FolderOpen,
  Pin: _Pin,
  Bookmark: _Bookmark,
  Star: _Star,
} satisfies IconMap;


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §2 · CHAT ICONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const ChatIcons = {
  // Message input
  Send: _SendHorizontal,
  Attach: _Paperclip,
  Emoji: _Smile,
  Gif: _Film,
  Sticker: _Sticker,
  AddReaction: _SmilePlus,
  Mention: _AtSign,
  SlashCommand: _Minus,

  // Message toolbar (on hover)
  React: _SmilePlus,
  Reply: _Reply,
  ReplyAll: _ReplyAll,
  Edit: _Pencil,
  Delete: _Trash2,
  Pin: _Pin,
  Unpin: _PinOff,
  CopyText: _Copy,
  CopyLink: _Link2,
  Forward: _Forward,
  MarkUnread: _MailOpen,
  Save: _Bookmark,
  Report: _Flag,
  MoreActions: _MoreHorizontal,

  // Thread / reply
  OpenThread: _MessageSquareMore,
  ViewThread: _MessageSquareReply,
  JumpToMessage: _ArrowRight,

  // Text formatting
  Bold: _Bold,
  Italic: _Italic,
  Underline: _Underline,
  Strikethrough: _Strikethrough,
  InlineCode: _Code,
  CodeBlock: _Code2,
  BlockQuote: _Quote,

  // Attachment / embed
  DownloadFile: _Download,
  OpenExternal: _ExternalLink,
  ExpandImage: _Maximize2,
  CollapseImage: _Minimize2,

  // Reactions
  ThumbsUp: _ThumbsUp,
  ThumbsDown: _ThumbsDown,
  Heart: _Heart,
  Laugh: _Laugh,
  PartyPopper: _PartyPopper,
} satisfies IconMap;


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §3 · VOICE & VIDEO ICONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const VoiceIcons = {
  // Microphone
  MicOn: _Mic,
  MicOff: _MicOff,

  // Speaker / audio
  SpeakerOn: _Volume2,
  SpeakerOff: _VolumeX,
  SpeakerMuted: _VolumeOff,
  Headphones: _Headphones,

  // Camera / video
  CameraOn: _Camera,
  CameraOff: _CameraOff,
  VideoOn: _Video,
  VideoOff: _VideoOff,

  // Screen share
  ScreenShareOn: _ScreenShare,
  ScreenShareOff: _ScreenShareOff,
  ShareWindow: _Monitor,
  StopShare: _MonitorOff,
  CastScreen: _Cast,

  // Call controls
  JoinCall: _PhoneCall,
  LeaveCall: _PhoneOff,
  IncomingCall: _Phone,
  MissedCall: _PhoneMissed,

  // Stage
  RaiseHand: _Hand,
  SpeakerStage: _Megaphone,
  Podcast: _Podcast,
} satisfies IconMap;


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §4 · USER & PROFILE ICONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const UserIcons = {
  // Profile
  Profile: _User,
  EditProfile: _Pencil,
  Avatar: _CircleUser,
  ViewProfile: _Eye,
  Contact: _Contact,

  // Friends
  AddFriend: _UserPlus,
  RemoveFriend: _UserMinus,
  BlockUser: _UserX,
  AcceptFriend: _UserCheck,
  ManageUser: _UserCog,
  FriendsList: _Users,

  // Status
  StatusOnline: _CircleDot,
  StatusIdle: _Clock,
  StatusDnd: _Minus,
  StatusOffline: _Circle,

  // Roles & badges
  Verified: _BadgeCheck,
  Admin: _ShieldCheck,
  Moderator: _Shield,
  Bot: _Zap,
  Owner: _Crown,
  Booster: _Sparkles,
  Staff: _Award,

  // Actions
  CopyUsername: _Copy,
  SendDM: _Mail,
  MentionUser: _AtSign,
  ShareProfile: _Share2,
  ReportUser: _Flag,
} satisfies IconMap;


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §5 · SERVER ICONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const ServerIcons = {
  // Management
  ServerSettings: _Settings2,
  EditServer: _Pencil,
  InvitePeople: _UserPlus,
  CreateChannel: _Plus,
  CreateCategory: _FolderOpen,
  Integrations: _Zap,
  AuditLog: _BookOpen,
  Bans: _Gavel,
  Members: _UsersRound,
  Roles: _Shield,

  // Features
  Boost: _Sparkles,
  Nitro: _Diamond,
  Discovery: _Compass,
  Rules: _BookOpen,
  Announcements: _Megaphone,
  Webhooks: _Link2,
  EmojiPacks: _Smile,
  StickerPacks: _Sticker,

  // Actions
  LeaveServer: _LogOut,
  DeleteServer: _Trash2,
  CopyServerId: _Copy,
  InviteLink: _Link,
  MarkAllRead: _Check,

  // Privacy
  PublicServer: _Globe,
  PrivateServer: _Lock,
  CommunityServer: _Globe,
} satisfies IconMap;


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §6 · NOTIFICATION ICONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const NotificationIcons = {
  // Bell states
  BellAll: _Bell,
  BellMentions: _BellRing,
  BellNone: _BellOff,
  BellMuted: _BellOff,

  // Alert types
  Mention: _AtSign,
  DirectMessage: _Mail,
  FriendRequest: _UserPlus,
  ServerInvite: _Link,
  SystemAlert: _AlertCircle,
  Success: _CircleCheck,
  Warning: _TriangleAlert,
  Error: _CircleX,
  Info: _Info,

  // Inbox
  OpenInbox: _Inbox,
  MarkRead: _Check,
  MarkAllRead: _Check,
  ClearAll: _X,
} satisfies IconMap;


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §7 · SETTINGS ICONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SettingsIcons = {
  // Sections
  MyAccount: _User,
  Profiles: _CircleUser,
  Privacy: _Shield,
  Safety: _ShieldCheck,
  Authorizations: _Key,
  Devices: _Monitor,
  Appearance: _Eye,
  Accessibility: _Activity,
  VoiceAndVideo: _Headphones,
  TextAndImages: _MessageSquare,
  Notifications: _Bell,
  Keybinds: _Key,
  Language: _Globe,
  StreamerMode: _Video,
  Advanced: _Sliders,
  Experiments: _Zap,
  HypesquadEvents: _Sparkles,

  // Actions
  Save: _Save,
  Reset: _Undo2,
  Close: _X,
  LogOut: _LogOut,
  ChangePassword: _Key,
  TwoFactor: _ShieldAlert,
  DeleteAccount: _Trash2,
  Toggle: _ToggleRight,
  Wrench: _Wrench,
  Power: _Power,
} satisfies IconMap;


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §8 · MODERATION ICONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const ModerationIcons = {
  // Actions
  Ban: _Ban,
  Kick: _UserX,
  Mute: _MicOff,
  Deafen: _VolumeX,
  Warn: _TriangleAlert,
  Timeout: _Timer,
  Unban: _CircleCheck,
  Unmute: _Mic,
  DeleteMessage: _Trash2,
  BulkDelete: _Trash2,
  PinMessage: _Pin,
  SlowMode: _Timer,
  LockChannel: _Lock,
  UnlockChannel: _Unlock,
  MoveToChannel: _ArrowRight,

  // Reports
  Report: _Flag,
  AuditLog: _BookOpen,
  Evidence: _FileText,
  CaseHistory: _BookOpen,

  // Trust & Safety
  Shield: _Shield,
  SafetyAlert: _ShieldAlert,
  BanList: _Gavel,
  AutoMod: _Zap,
  BlockedWords: _OctagonAlert,
  RaidAlert: _AlertCircle,
  Scale: _Scale,
  Hammer: _Hammer,
} satisfies IconMap;


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §9 · MEDIA & FILE ICONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const MediaIcons = {
  // File types
  GenericFile: _File,
  TextFile: _FileText,
  ImageFile: _FileImage,
  VideoFile: _Film,
  AudioFile: _Music2,
  CodeFile: _FileCode,

  // Actions
  Upload: _Upload,
  Download: _Download,
  CopyLink: _Link2,
  OpenExternal: _ExternalLink,
  Preview: _Eye,
  Share: _Share2,
  Cut: _Scissors,

  // Media player
  Play: _Video,
  Expand: _Maximize2,
  Collapse: _Minimize2,
  Mute: _VolumeX,
  Unmute: _Volume2,

  // Gallery / cloud
  AllImages: _Images,
  AddImage: _ImagePlus,
  HideImage: _ImageOff,
  CloudStorage: _Cloud,
  CloudOffline: _CloudOff,
  Clipboard: _Clipboard,
} satisfies IconMap;


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §10 · NITRO & PREMIUM ICONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const NitroIcons = {
  Nitro: _Diamond,
  NitroBasic: _Gem,
  Boost: _Sparkles,
  BoostLevel: _Zap,
  Crown: _Crown,
  Gift: _Gift,
  Rocket: _Rocket,
  Flame: _Flame,
  StarBadge: _Star,
  ActivityBadge: _Activity,
  BadgeCheck: _BadgeCheck,
} satisfies IconMap;


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §11 · GENERIC UI ICONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const UIIcons = {
  // Controls
  Close: _X,
  Add: _Plus,
  Remove: _Minus,
  Confirm: _Check,
  More: _MoreHorizontal,
  MoreVert: _MoreVertical,
  Menu: _Menu,
  Search: _Search,
  Filter: _SlidersHorizontal,
  Sort: _ChevronsUpDown,
  Refresh: _RefreshCw,
  Loading: _Loader2,

  // Navigation arrows
  Back: _ArrowLeft,
  Forward: _ArrowRight,
  Up: _ChevronUp,
  Down: _ChevronDown,
  Left: _ChevronLeft,
  Right: _ChevronRight,

  // State indicators
  Success: _CircleCheck,
  Error: _CircleX,
  Warning: _TriangleAlert,
  Info: _Info,
  Help: _HelpCircle,
  Empty: _Inbox,
  Offline: _CircleOff,
  Alert: _CircleAlert,
  HelpCircle: _CircleHelp,

  // Layout & actions
  Grid: _LayoutGrid,
  Expand: _Maximize2,
  Collapse: _Minimize2,
  Copy: _Copy,
  Share: _Share2,
  Link: _Link,
  External: _ExternalLink,
  Tag: _Tag,
  Pin: _Pin,
  Pinned: _PinOff,
  Calendar: _Calendar,
  Clock: _Clock,
  MapPin: _MapPin,
  Sun: _Sun,
  Moon: _Moon,
  Move: _Move,
  DragHandle: _GripVertical,
} satisfies IconMap;


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §12 · FLAT Icons MAP (all namespaces merged — for dynamic lookup)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const Icons = {
  ...SidebarIcons,
  ...ChatIcons,
  ...VoiceIcons,
  ...UserIcons,
  ...ServerIcons,
  ...NotificationIcons,
  ...SettingsIcons,
  ...ModerationIcons,
  ...MediaIcons,
  ...NitroIcons,
  ...UIIcons,
} as const satisfies IconMap;

/** Union of every semantic icon key — use for typed icon name props */
export type IconName = keyof typeof Icons;


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §13 · UTILITY — look up an icon component by its semantic name
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Returns the LucideIcon component for a given semantic name.
 * @example
 *   const Icon = getIcon("SendMessage")
 *   return <Icon size={16} />
 */
export function getIcon(name: IconName): LucideIcon {
  return Icons[name] as LucideIcon;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEFAULT EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const discordIcons = {
  Icons,
  SidebarIcons,
  ChatIcons,
  VoiceIcons,
  UserIcons,
  ServerIcons,
  NotificationIcons,
  SettingsIcons,
  ModerationIcons,
  MediaIcons,
  NitroIcons,
  UIIcons,
  getIcon,
} as const;

export default discordIcons;


/*
═══════════════════════════════════════════════════════════════════════
QUICK REFERENCE
═══════════════════════════════════════════════════════════════════════

INSTALL
  npm install lucide-react

① Namespace import (recommended — tree-shakeable)
  import { ChatIcons, VoiceIcons } from "./iconConfig"

  const { Send, Emoji, Attach } = ChatIcons
  const { MicOn, MicOff, LeaveCall } = VoiceIcons

  <Send size={20} className="text-white" />
  <MicOff size={16} strokeWidth={2} />

② Raw lucide icon (still available — re-exported via export *)
  import { Hash, Bell, Search } from "./iconConfig"
  <Hash size={16} />

③ Flat Icons map — one object, every semantic name
  import { Icons } from "./iconConfig"
  <Icons.Send size={20} />
  <Icons.MicOff size={16} />

④ Dynamic by string name — data-driven UIs
  import { getIcon } from "./iconConfig"
  import type { IconName } from "./iconConfig"

  const name: IconName = "Send"
  const Icon = getIcon(name)
  <Icon size={16} />

⑤ Type-safe icon prop on a component
  import type { Icon, IconName } from "./iconConfig"

  interface ButtonProps {
    icon:  Icon      // LucideIcon component type
    label: string
  }

⑥ Default import
  import discord from "./iconConfig"
  const { Send } = discord.ChatIcons
  <Send size={20} />

═══════════════════════════════════════════════════════════════════════
NAMESPACES AT A GLANCE
═══════════════════════════════════════════════════════════════════════
  SidebarIcons      →  rail, channel types, categories, member list
  ChatIcons         →  input bar, toolbar, reactions, formatting
  VoiceIcons        →  mic, camera, screen share, call controls
  UserIcons         →  profile, friends, status, role badges
  ServerIcons       →  management, features, privacy, invite
  NotificationIcons →  bell states, alert types, inbox
  SettingsIcons     →  every settings section + save/reset/logout
  ModerationIcons   →  ban/kick/mute, reports, automod, safety
  MediaIcons        →  file types, player controls, gallery, cloud
  NitroIcons        →  nitro, boost, premium badges
  UIIcons           →  generic controls, nav, states, layout
═══════════════════════════════════════════════════════════════════════
*/