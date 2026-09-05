"use client";

import { useEffect } from "react";
import { readLocalLessons, readLocalSettings, watchCatalogLessons, watchCatalogTemplates, watchPublicPricing } from "@/lib/db";
import { setLiveLessons, setLivePricing, setLiveTemplates } from "@/lib/catalogStore";
import { lessons } from "@/lib/lessons";
import { publicPricing } from "@/lib/settings";
import { mergeCatalogTemplates } from "@/lib/templates";

export function CatalogHydrator() {
  useEffect(() => {
    setLiveLessons(readLocalLessons()?.items ?? lessons);
    setLivePricing(publicPricing(readLocalSettings()));
    const stopT = watchCatalogTemplates((list) => {
      const next = mergeCatalogTemplates(list);
      setLiveTemplates(next);
    });
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
