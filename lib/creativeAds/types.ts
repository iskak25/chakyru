import type { EventType, Locale } from "../types";

export type CreativeStyleId =
  | "luxury"
  | "minimal"
  | "editorial"
  | "romantic"
  | "traditionalKyrgyz"
  | "modernKyrgyz"
  | "emotional"
  | "premiumBlack"
  | "goldWedding"
  | "cleanWhite";

export type CreativeFormatId =
  | "igPost"
  | "igStory"
  | "fbPost"
  | "fbFeed"
  | "waStatus"
  | "tgPost";

export type CreativeLanguage = Locale | "en";

export type CreativeAdStatus = "pending" | "generating" | "ready" | "failed";

export type CreativeVariant = {
  id: string;
  style: CreativeStyleId;
  label: string;
  sceneUrl: string;
  inviteUrl: string;
  prompt: string;
};

export type CreativeAd = {
  id: string;
  userId: string;
  templateId: string;
  style: CreativeStyleId;
  format: CreativeFormatId;
  language: CreativeLanguage;
  eventType: EventType;
  status: CreativeAdStatus;
  title: string;
  subtitle: string;
  cta: string;
  favorite: boolean;
  overlay: number;
  blur: number;
  textColor: string;
  buttonColor: string;
  align: "left" | "center" | "right";
  fontSize: number;
  variants: CreativeVariant[];
  activeVariantId: string;
  prompt: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreativeFormat = {
  id: CreativeFormatId;
  ratio: string;
  width: number;
  height: number;
  platform: "instagram" | "facebook" | "whatsapp" | "telegram";
};

export const CREATIVE_STYLES: {
  id: CreativeStyleId;
  scene: string;
  tone: string;
}[] = [
  { id: "luxury", scene: "/images/journal-rings.jpg", tone: "dark premium wedding table" },
  { id: "minimal", scene: "/images/editorial-couple.jpg", tone: "clean light editorial" },
  { id: "editorial", scene: "/images/journal-walk.jpg", tone: "fashion wedding photography" },
  { id: "romantic", scene: "/images/journal-hands.jpg", tone: "soft romantic florals" },
  { id: "traditionalKyrgyz", scene: "/images/hero-family.jpg", tone: "modern kyrgyz celebration, subtle" },
  { id: "modernKyrgyz", scene: "/images/journal-walk.jpg", tone: "contemporary kyrgyz couple" },
  { id: "emotional", scene: "/images/journal-hands.jpg", tone: "guests sharing invitation on phone" },
  { id: "premiumBlack", scene: "/images/journal-rings.jpg", tone: "black luxury studio" },
  { id: "goldWedding", scene: "/images/editorial-couple.jpg", tone: "warm antique gold wedding" },
  { id: "cleanWhite", scene: "/images/hero-family.jpg", tone: "bright ivory studio" },
];

export const CREATIVE_FORMATS: CreativeFormat[] = [
  { id: "igPost", ratio: "1:1", width: 1080, height: 1080, platform: "instagram" },
  { id: "igStory", ratio: "9:16", width: 1080, height: 1920, platform: "instagram" },
  { id: "fbPost", ratio: "1:1", width: 1080, height: 1080, platform: "facebook" },
  { id: "fbFeed", ratio: "4:5", width: 1080, height: 1350, platform: "facebook" },
  { id: "waStatus", ratio: "9:16", width: 1080, height: 1920, platform: "whatsapp" },
  { id: "tgPost", ratio: "1:1", width: 1080, height: 1080, platform: "telegram" },
];

export const RESULT_STYLES: CreativeStyleId[] = ["luxury", "minimal", "editorial", "emotional"];

export function formatAspect(format: CreativeFormatId) {
  const item = CREATIVE_FORMATS.find((f) => f.id === format) ?? CREATIVE_FORMATS[0];
  return `${item.width} / ${item.height}`;
}

export function defaultCopy(language: CreativeLanguage) {
  if (language === "ky") {
    return {
      title: "Айгерим & Нурлан",
      subtitle: "Сиздин тойго чакыруу Chakyru менен",
      cta: "Чакыруу түзүү →",
    };
  }
  if (language === "en") {
    return {
      title: "Aigerim & Nurlan",
      subtitle: "Create your invitation with Chakyru",
      cta: "Create invitation →",
    };
  }
  return {
    title: "Айгерим & Нурлан",
    subtitle: "Создайте приглашение в Chakyru",
    cta: "Создать приглашение →",
  };
}
