"use client";

import dynamic from "next/dynamic";
import { LocaleProvider } from "@/lib/locale";
import { CatalogHydrator } from "./CatalogHydrator";
import { FirebaseSession } from "./FirebaseSession";

const StagewiseDev =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("./StagewiseDev").then((m) => m.StagewiseDev), {
        ssr: false,
      })
    : () => null;

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <FirebaseSession />
      <CatalogHydrator />
      <StagewiseDev />
      {children}
    </LocaleProvider>
  );
}
