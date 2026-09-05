"use client";

import { resolveInviteFamily } from "@/lib/inviteFamilies";
import { FamilyLayout, FamilyThumb } from "./invite-families";
import type { LayoutKit, Site3DLabels } from "./Site3DLayouts";

export function Site3DInner({ kit }: { kit: LayoutKit }) {
  return <FamilyLayout family={resolveInviteFamily(kit.invitation.templateId, kit.look.pageLayout)} kit={kit} />;
}

export function Site3DThumb({
  look,
  a,
  b,
  heroPhoto,
}: {
  look: LayoutKit["look"];
  labels: Site3DLabels;
  a: string;
  b: string;
  photos: string[];
  heroPhoto: string;
}) {
  return <FamilyThumb family={resolveInviteFamily(look.id, look.pageLayout)} a={a} b={b} heroPhoto={heroPhoto} />;
}
