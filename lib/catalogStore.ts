import type { Lesson } from "./lessons";
import type { InvitationTemplate } from "./types";
import type { PublicPricing } from "./settings";

let liveTemplates: InvitationTemplate[] | null = null;
let liveLessons: Lesson[] | null = null;
let livePricing: PublicPricing | null = null;
let preview: InvitationTemplate | null = null;

function emit() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("chakyru-catalog"));
}

export function peekTemplates() {
  return liveTemplates;
}

export function peekLessons() {
  return liveLessons;
}

export function peekPreview() {
  return preview;
}

export function setLiveTemplates(list: InvitationTemplate[]) {
  liveTemplates = list;
  emit();
}

export function setLiveLessons(list: Lesson[]) {
  liveLessons = list;
  emit();
}

export function peekPricing() {
  return livePricing;
}

export function setLivePricing(next: PublicPricing) {
  livePricing = next;
  emit();
}

export function setPreviewTemplate(next: InvitationTemplate | null) {
  preview = next;
  emit();
}
