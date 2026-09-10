import type { InvitationTemplate, InviteFormat } from "./types";

// Retired catalogue entries must stay hidden even in older saved catalogues.
const RETIRED_TEMPLATE_IDS = new Set([
  "zhuzum", "rosa", "midnight", "ala-too", "jubilee-gold", "iftar-table",
]);

export function isInviteFormat(value: unknown): value is InviteFormat {
  return value === "site3d" || value === "photo";
}

export function isCatalogTemplate(value: unknown): value is InvitationTemplate {
  if (!value || typeof value !== "object") return false;
  const item = value as { id?: unknown; format?: unknown };
  return typeof item.id === "string" && !RETIRED_TEMPLATE_IDS.has(item.id) && isInviteFormat(item.format);
}
