import { getTemplatePhotos } from "../templatePhotos";
import { buildCreativePrompt } from "./prompt";
import {
  CREATIVE_STYLES,
  RESULT_STYLES,
  defaultCopy,
  type CreativeAd,
  type CreativeFormatId,
  type CreativeLanguage,
  type CreativeStyleId,
  type CreativeVariant,
} from "./types";
import type { EventType } from "../types";

export type GenerateInput = {
  userId: string;
  templateId: string;
  templateName: string;
  style: CreativeStyleId;
  format: CreativeFormatId;
  language: CreativeLanguage;
  eventType: EventType;
};

export interface CreativeAdsProvider {
  generate(input: GenerateInput): Promise<{
    variants: CreativeVariant[];
    prompt: string;
    copy: ReturnType<typeof defaultCopy>;
  }>;
}

/** Local composition provider — works without external AI keys. */
export class LocalCompositionProvider implements CreativeAdsProvider {
  async generate(input: GenerateInput) {
    const photos = getTemplatePhotos(input.templateId);
    const inviteUrl = photos.hero || "/images/journal-walk.jpg";
    const styles = [input.style, ...RESULT_STYLES.filter((id) => id !== input.style)].slice(0, 4);
    const variants: CreativeVariant[] = styles.map((styleId, index) => {
      const preset = CREATIVE_STYLES.find((item) => item.id === styleId) ?? CREATIVE_STYLES[0];
      const prompt = buildCreativePrompt({
        ...input,
        style: styleId,
        inviteUrl,
      });
      return {
        id: `v${index + 1}`,
        style: styleId,
        label: styleId,
        sceneUrl: preset.scene,
        inviteUrl: index % 2 === 0 ? inviteUrl : photos.c0 || inviteUrl,
        prompt,
      };
    });
    const prompt = buildCreativePrompt({ ...input, inviteUrl });
    return {
      variants,
      prompt,
      copy: defaultCopy(input.language),
    };
  }
}

export function getCreativeAdsProvider(): CreativeAdsProvider {
  return new LocalCompositionProvider();
}

export function emptyCreativeAd(partial: Partial<CreativeAd> & Pick<CreativeAd, "id" | "userId" | "templateId">): CreativeAd {
  const now = new Date().toISOString();
  return {
    style: "luxury",
    format: "igPost",
    language: "ru",
    eventType: "wedding",
    status: "pending",
    title: "",
    subtitle: "",
    cta: "",
    favorite: false,
    overlay: 0.35,
    blur: 0,
    textColor: "#F5F1EA",
    buttonColor: "#0F0C0A",
    align: "center",
    fontSize: 42,
    variants: [],
    activeVariantId: "",
    prompt: "",
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}
