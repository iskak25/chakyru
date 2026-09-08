import { CREATIVE_STYLES, type CreativeLanguage, type CreativeStyleId, type CreativeFormatId } from "./types";

export function buildCreativePrompt(input: {
  templateId: string;
  templateName: string;
  style: CreativeStyleId;
  format: CreativeFormatId;
  language: CreativeLanguage;
  eventType: string;
  inviteUrl: string;
}) {
  const style = CREATIVE_STYLES.find((item) => item.id === input.style);
  return [
    "Create a luxury editorial advertising photograph for a digital wedding invitation product.",
    `Product: Chakyru invitation template "${input.templateName}" (${input.templateId}).`,
    `Event: ${input.eventType}. Language context: ${input.language}. Format: ${input.format}.`,
    `Scene mood: ${style?.tone ?? "premium wedding"}.`,
    "CRITICAL: The invitation design itself must remain unchanged — do not alter typography, names, colors, layout, ornaments, or invitation text.",
    "Only generate environment, lighting, flowers, props, people, phone framing, and atmosphere around the invitation.",
    `Use the invitation preview asset as-is: ${input.inviteUrl}.`,
    "Style: warm cream, espresso, antique gold, editorial wedding photography, no neon AI look.",
  ].join(" ");
}
