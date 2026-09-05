export const INVITE_FAMILIES = ["luxury", "elegant", "modern", "romantic", "traditional", "ivory", "mauve"] as const;

export type InviteFamily = (typeof INVITE_FAMILIES)[number];

const FAMILY_BY_TEMPLATE: Record<string, InviteFamily> = {
  "ak-shumkar": "luxury",
  elegant: "luxury",
  "tun-almaz": "luxury",
  komur: "luxury",
  "ak-kara": "luxury",
  "veil-kun": "luxury",
  atelier: "luxury",

  klassika: "elegant",
  "ak-kyoshok": "elegant",
  "tan-tuman": "elegant",
  "altyn-kun": "elegant",
  mramor: "elegant",
  "ak-bilet": "elegant",

  "modern-cream": "modern",
  "zhas-shamal": "modern",
  jeek: "modern",
  nishan: "modern",
  polaroid: "modern",

  "kyz-gulu": "romantic",
  jipek: "romantic",
  "gul-zar": "romantic",
  romashka: "romantic",
  "shai-gul": "romantic",
  mak: "romantic",
  baxmal: "romantic",

  salt: "traditional",
  "altin-jildiz": "traditional",
  "ramadan-nur": "traditional",
  "kok-too": "traditional",
  "toi-kyzyl": "traditional",
  "beshik-jyluu": "traditional",
  shyrdak: "traditional",
  "zhai-tokoi": "traditional",

  ivory: "ivory",
  mauve: "mauve",
};

export function getInviteFamily(templateId: string): InviteFamily {
  return FAMILY_BY_TEMPLATE[templateId] ?? "elegant";
}

export function resolveInviteFamily(templateId: string, pageLayout?: string): InviteFamily {
  if (pageLayout && (INVITE_FAMILIES as readonly string[]).includes(pageLayout)) {
    return pageLayout as InviteFamily;
  }
  return getInviteFamily(templateId);
}
