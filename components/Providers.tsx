"use client";

import { LocaleProvider } from "@/lib/locale";
import { CatalogHydrator } from "./CatalogHydrator";
import { FirebaseSession } from "./FirebaseSession";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <FirebaseSession />
      <CatalogHydrator />
      {children}
    </LocaleProvider>
  );
}
