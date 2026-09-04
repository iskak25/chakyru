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
    // #region agent log
    fetch("http://127.0.0.1:7861/ingest/fdb6035a-9503-48b4-894a-ead00d842d89", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "c008f9" },
      body: JSON.stringify({
        sessionId: "c008f9",
        hypothesisId: "E",
        location: "CatalogHydrator.tsx:init",
        message: "catalog waiting for remote prices",
        data: { source: "seed-until-firestore" },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    const stopT = watchCatalogTemplates((list) => {
      const next = mergeCatalogTemplates(list);
      setLiveTemplates(next);
      // #region agent log
      fetch("http://127.0.0.1:7861/ingest/fdb6035a-9503-48b4-894a-ead00d842d89", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "c008f9" },
        body: JSON.stringify({
          sessionId: "c008f9",
          hypothesisId: "J",
          location: "CatalogHydrator.tsx:watch",
          message: "catalog watch merge",
          data: {
            incoming: list.slice(0, 4).map((item) => ({ id: item.id, priceSom: item.priceSom })),
            merged: next.slice(0, 4).map((item) => ({ id: item.id, priceSom: item.priceSom })),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
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
