"use client";

import type { ReactNode } from "react";
import type { SitePageLayout } from "@/lib/siteLooks";
import {
  BASE_LAYOUTS,
  Site3DThumb as BaseThumb,
  type LayoutKit,
  type Site3DLabels,
} from "./Site3DLayouts";
import {
  LayoutArchive,
  LayoutAtelier,
  LayoutDusk,
  LayoutEngage,
  LayoutMarble,
  LayoutPoppy,
  LayoutSatin,
  LayoutSplash,
  LayoutSplitBrush,
  LayoutStorybook,
  LayoutVelvet,
  LayoutWatermark,
  moreLayoutThumb,
} from "./Site3DMoreLayouts";
import {
  LayoutMonoInk,
  LayoutOliveWave,
  LayoutRoundedMono,
  LayoutSoftInvite,
  inviteLayoutThumb,
} from "./Site3DInviteLayouts";

const MORE_LAYOUTS: Partial<Record<SitePageLayout, (kit: LayoutKit) => ReactNode>> = {
  storybook: (kit) => <LayoutStorybook kit={kit} />,
  poppy: (kit) => <LayoutPoppy kit={kit} />,
  velvet: (kit) => <LayoutVelvet kit={kit} />,
  watermark: (kit) => <LayoutWatermark kit={kit} />,
  satin: (kit) => <LayoutSatin kit={kit} />,
  archive: (kit) => <LayoutArchive kit={kit} />,
  atelier: (kit) => <LayoutAtelier kit={kit} />,
  dusk: (kit) => <LayoutDusk kit={kit} />,
  splash: (kit) => <LayoutSplash kit={kit} />,
  engage: (kit) => <LayoutEngage kit={kit} />,
  splitbrush: (kit) => <LayoutSplitBrush kit={kit} />,
  marble: (kit) => <LayoutMarble kit={kit} />,
  oliveWave: (kit) => <LayoutOliveWave kit={kit} />,
  monoInk: (kit) => <LayoutMonoInk kit={kit} />,
  roundedMono: (kit) => <LayoutRoundedMono kit={kit} />,
  softInvite: (kit) => <LayoutSoftInvite kit={kit} />,
};

export function Site3DInner({ kit }: { kit: LayoutKit }) {
  const render = MORE_LAYOUTS[kit.look.pageLayout] ?? BASE_LAYOUTS[kit.look.pageLayout] ?? BASE_LAYOUTS.classic;
  return render!(kit);
}

export function Site3DThumb({
  look,
  labels,
  a,
  b,
  photos,
  heroPhoto,
}: {
  look: LayoutKit["look"];
  labels: Site3DLabels;
  a: string;
  b: string;
  photos: string[];
  heroPhoto: string;
}) {
  const extra = inviteLayoutThumb(look.pageLayout, { a, b, heroPhoto }) ?? moreLayoutThumb(look.pageLayout, { a, b, heroPhoto, look });
  if (extra) return extra;
  return <BaseThumb look={look} labels={labels} a={a} b={b} photos={photos} heroPhoto={heroPhoto} />;
}
