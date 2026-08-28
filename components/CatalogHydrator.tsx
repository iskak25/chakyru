"use client";

import { useEffect } from "react";
import { readLocalLessons, readLocalSettings, readLocalTemplates, watchCatalogLessons, watchCatalogTemplates, watchPublicPricing } from "@/lib/db";
import { setLiveLessons, setLivePricing, setLiveTemplates } from "@/lib/catalogStore";
import { lessons } from "@/lib/lessons";
import { publicPricing } from "@/lib/settings";
import { templates } from "@/lib/templates";
import type { InvitationTemplate } from "@/lib/types";

function mergeCatalog(live?: InvitationTemplate[] | null) {
  if (!live?.length) return templates;
  const ids = new Set(live.map((item) => item.id));
  const extra = templates.filter((item) => !ids.has(item.id));
  return extra.length ? [...live, ...extra] : live;
}

export function CatalogHydrator() {
  useEffect(() => {
    setLiveTemplates(mergeCatalog(readLocalTemplates()?.items));
    setLiveLessons(readLocalLessons()?.items ?? lessons);
    setLivePricing(publicPricing(readLocalSettings()));
    const stopT = watchCatalogTemplates((list) => setLiveTemplates(mergeCatalog(list)));
    const stopL = watchCatalogLessons(setLiveLessons);
    const stopP = watchPublicPricing(setLivePricing);
    return () => {
      stopT?.();
      stopL?.();
      stopP?.();
    };
  }, []);
  return null;
}
