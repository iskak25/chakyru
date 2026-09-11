import type { InvitationTemplate } from "./types";

export const envelopeVariants = {
  cream: { paper: "#e9dcc6", light: "#f5ead8", shade: "#cdb998", background: "#e9e2d6", ink: "#57452f", foil: "#9c7a42", lining: "#706448", seal: "#a7824c", motif: "botanical" },
  ivory: { paper: "#eeebe4", light: "#fffdf7", shade: "#d4cdbf", background: "#e1ded7", ink: "#5d594d", foil: "#aca083", lining: "#b7b6a7", seal: "#c7b992", motif: "botanical" },
  burgundy: { paper: "#61242e", light: "#803541", shade: "#421721", background: "#28181e", ink: "#f0dfbf", foil: "#d3b279", lining: "#c7b18b", seal: "#bd9257", motif: "botanical" },
  sage: { paper: "#879781", light: "#a3b09a", shade: "#677963", background: "#e3e7dd", ink: "#f6efdf", foil: "#e3d3ae", lining: "#d8d4bd", seal: "#c2aa73", motif: "botanical" },
  forest: { paper: "#244b3f", light: "#396453", shade: "#17392e", background: "#172c25", ink: "#f1e6cc", foil: "#d5b777", lining: "#b5b29a", seal: "#bd9455", motif: "botanical" },
  blackGold: { paper: "#252424", light: "#41403c", shade: "#151515", background: "#151616", ink: "#eee0c2", foil: "#c9a76c", lining: "#8b795a", seal: "#b18b4d", motif: "minimal" },
  midnight: { paper: "#232841", light: "#3a405c", shade: "#151a30", background: "#111425", ink: "#f1e7ce", foil: "#cbb47d", lining: "#877a73", seal: "#bb9c5b", motif: "stars" },
  blush: { paper: "#d9b3b1", light: "#edccca", shade: "#bc9293", background: "#f0e3dd", ink: "#71444a", foil: "#986c4d", lining: "#b7a399", seal: "#b78970", motif: "botanical" },
  ice: { paper: "#aebfce", light: "#cedde7", shade: "#8b9fb2", background: "#e2e9ef", ink: "#344d63", foil: "#6d8498", lining: "#dce2df", seal: "#a5b4bf", motif: "stars" },
  ethno: { paper: "#722e33", light: "#93474a", shade: "#501d27", background: "#302022", ink: "#f4e5c7", foil: "#dec18c", lining: "#c3aa82", seal: "#c3a063", motif: "ethno" },
  ethnoCream: { paper: "#eadfc9", light: "#fbf0dc", shade: "#c9b797", background: "#e3d8c4", ink: "#725531", foil: "#ad8748", lining: "#977c57", seal: "#af884b", motif: "ethno" },
} as const;

export type EnvelopeVariant = keyof typeof envelopeVariants;
export type EnvelopeConfig = { enabled: boolean; variant: EnvelopeVariant };

// Explicit art direction for every built-in 3D design; unrelated to routes or filenames.
const referenceVariants: Record<string, EnvelopeVariant> = {
  tuscany: "cream", burgundy: "burgundy", rose: "blush", sage: "sage", mountains: "forest",
  winter: "ice", calligraphy: "blush", silk: "ivory", stars: "midnight",
};
const pinterestVariants: Record<string, EnvelopeVariant> = {
  ethno: "ethno", burgundy: "ethno", goldBride: "ethnoCream", pearl: "ivory", blue: "midnight",
  silkSite: "sage", nikahSite: "ivory", monoSite: "blackGold", newspaperSite: "blackGold",
  glam: "blackGold", blushParty: "blush", jentekCradle: "ethnoCream", tushooGarden: "sage",
};

export function envelopeForTemplate(template: InvitationTemplate): EnvelopeConfig {
  if (template.format !== "site3d") return { enabled: false, variant: "cream" };
  if (template.envelope && Object.hasOwn(envelopeVariants, template.envelope.variant)) return template.envelope;
  const copy = template.canvas?.copy;
  const variant = referenceVariants[copy?.["reference.design"] || ""] || pinterestVariants[copy?.["pinterest.design"] || ""]
    || (template.style.pageLayout === "velvet" ? "burgundy" : template.eventTypes.includes("kyz") ? "ethnoCream" : "cream");
  return { enabled: true, variant };
}

export function withEnvelope(template: InvitationTemplate): InvitationTemplate {
  return { ...template, envelope: envelopeForTemplate(template) };
}

export function shouldShowEnvelope(template: InvitationTemplate, options: { interactive?: boolean; startOpen?: boolean; editing?: boolean }) {
  return template.format === "site3d" && envelopeForTemplate(template).enabled && !!options.interactive && !options.startOpen && !options.editing;
}

export const ENVELOPE_TIMING = { reveal: 1650, complete: 2400, reducedReveal: 40, reducedComplete: 180 } as const;
