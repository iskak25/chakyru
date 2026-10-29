// Какие шаги пошагового заполнения показывать для шаблона (ТЗ §3: только реально поддерживаемые поля).
// Поддержка определяется по частям шаблона, которые он регистрирует в редакторе (WeddingPartInfo).
// Пока части не зарегистрированы (или шаблон их не сообщает), показываем основные шаги: данные хранятся
// в обычных полях приглашения, новых полей в документе мастер не создаёт.
import type { Invitation } from "@/lib/types";
import type { WeddingPartInfo } from "@/lib/weddingEditor";

export type WizardStepId = "about" | "when" | "where" | "message" | "hosts" | "photos" | "design";

export type PhotoSlot = { key: string; label: string };

const MAX_PHOTOS = 3;

type Field = NonNullable<WeddingPartInfo["field"]>;

export const supportsField = (parts: WeddingPartInfo[], ...fields: Field[]) =>
  parts.length === 0 || parts.some(p => p.field !== undefined && fields.includes(p.field));

export const supportsEventTitle = (parts: WeddingPartInfo[]) => parts.some(p => p.id === "eventTitle");

/** Слоты фото шаблона; пустой список у шаблонов без частей означает «только обложка». */
export function photoSlots(parts: WeddingPartInfo[]): PhotoSlot[] {
  return parts
    .filter(p => p.kind === "image")
    .slice(0, MAX_PHOTOS)
    .map(p => ({ key: p.slot || p.id, label: p.label }));
}

export function wizardSteps(parts: WeddingPartInfo[]): WizardStepId[] {
  const steps: WizardStepId[] = [];
  if (supportsField(parts, "names") || supportsEventTitle(parts)) steps.push("about");
  steps.push("when");
  if (supportsField(parts, "venue", "address", "city")) steps.push("where");
  if (supportsField(parts, "message")) steps.push("message");
  if (supportsField(parts, "hosts")) steps.push("hosts");
  if (parts.length === 0 || photoSlots(parts).length > 0) steps.push("photos");
  if (parts.some(p => p.kind === "text")) steps.push("design");
  return steps;
}

/** Патч для фото: в слот галереи шаблона либо в обложку, если шаблон слотов не сообщает. Другие поля не затрагиваются. */
export function photoPatch(inv: Invitation, parts: WeddingPartInfo[], slot: string | null, src: string): Partial<Invitation> {
  return photoSlots(parts).length > 0 && slot ? { gallery: { ...inv.gallery, [slot]: src } } : { coverImage: src };
}
