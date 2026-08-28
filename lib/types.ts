import type { AnimKind } from "./anim";

export type Locale = "ky" | "ru";

export type EventType =
  | "toi"
  | "wedding"
  | "kyz"
  | "beshik"
  | "anniversary"
  | "iftar"
  | "birthday";

export type InviteFormat = "photo" | "videoMusic" | "videoVoice" | "site3d";

export type LocalizedName = { ky: string; ru: string };

export type RsvpStatus = "yes" | "no" | "maybe";

export type TemplateStyle = {
  bg: string;
  panel: string;
  accent: string;
  text: string;
  muted: string;
  ornament: string;
  overlay?: string;
  pageBg?: string;
  pageLayout?: "classic" | "editorial" | "arches" | "heroTimer" | "bloom";
};

export type InvitationTemplate = {
  id: string;
  name: LocalizedName;
  designer: string;
  format: InviteFormat;
  priceSom: number;
  priceTenge: number;
  eventTypes: EventType[];
  style: TemplateStyle;
  featured?: boolean;
  canvas?: TemplateCanvas;
};

export type Guest = {
  id: string;
  name: string;
  rsvp: RsvpStatus | null;
  plusOne: number;
};

export type Wish = {
  id: string;
  name: string;
  text: string;
  likes: number;
  createdAt: string;
};

export type LayoutBox = {
  x: number;
  y: number;
  w: number;
  h: number;
  z?: number;
  r?: number;
  locked?: boolean;
  hidden?: boolean;
};

export type LayoutMap = Record<string, LayoutBox>;

export type ShapeKind = "square" | "circle" | "triangle" | "star" | "heart" | "wreath";

export type CanvasItem = {
  id: string;
  kind: "text" | "guestName" | "shape" | "divider" | "button" | "image" | "map" | "countdown" | "sticker" | "clipart";
  shape?: ShapeKind;
  sticker?: string;
  text?: string;
  color: string;
  fontSize?: number;
  url?: string;
  src?: string;
  anim?: AnimKind;
};

export type TemplateCanvas = {
  layout: LayoutMap;
  extras: CanvasItem[];
  copy: Record<string, string>;
  gallery: Record<string, string>;
  blockColors: Record<string, string>;
  coverImage: string;
  names?: string;
  message?: string;
  musicUrl?: string;
};

export type Invitation = {
  id: string;
  templateId: string;
  eventType: EventType;
  names: string;
  hosts: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  city: string;
  message: string;
  dressCode: string;
  adultsOnly: boolean;
  music: boolean;
  musicUrl: string;
  mapUrl: string;
  voiceText: string;
  voiceUrl?: string;
  coverImage: string;
  layout: LayoutMap;
  extras: CanvasItem[];
  blockColors: Record<string, string>;
  copy?: Record<string, string>;
  gallery?: Record<string, string>;
  createdAt: string;
  guests: Guest[];
  wishes: Wish[];
  ownerId?: string;
};

export type AuthMethod = "name" | "google";
export type PlanId = "free" | "standard" | "pro" | "unlimited";
export type AccountRole = "admin" | "vip" | "user";

export type User = {
  id: string;
  name: string;
  role: "host" | "designer";
  auth: AuthMethod;
  email?: string;
  picture?: string;
  plan: PlanId;
  accountRole: AccountRole;
  templates?: string[];
};

export type SiteSettings = {
  proPriceSom: number;
  proPriceTenge: number;
  finikApiKey: string;
  finikAccountId: string;
  finikPrivateKey: string;
  finikMcc: string;
  finikBeta: boolean;
  siteUrl: string;
};
