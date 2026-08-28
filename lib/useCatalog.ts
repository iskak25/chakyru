"use client";

import { useEffect, useState } from "react";
import { peekLessons, peekPricing, peekTemplates } from "./catalogStore";
import { lessons as seedLessons } from "./lessons";
import { publicPricing, settingsFromEnv } from "./settings";
import { templates as seedTemplates } from "./templates";

export function useCatalog() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const on = () => setTick((n) => n + 1);
    window.addEventListener("chakyru-catalog", on);
    return () => window.removeEventListener("chakyru-catalog", on);
  }, []);
  return {
    templates: peekTemplates() ?? seedTemplates,
    lessons: peekLessons() ?? seedLessons,
    pricing: peekPricing() ?? publicPricing(settingsFromEnv()),
  };
}
