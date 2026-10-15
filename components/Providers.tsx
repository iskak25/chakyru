"use client";

import { LocaleProvider } from "@/lib/locale";
import { CatalogHydrator } from "./CatalogHydrator";
import dynamic from "next/dynamic";
import { GuestSubmissionFeedback } from "./GuestSubmissionFeedback";

// Firebase is large and only needed for the signed-in session, so it loads after the first paint.
const FirebaseSession = dynamic(() => import("./FirebaseSession").then((m) => m.FirebaseSession), { ssr: false });

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <FirebaseSession />
      <CatalogHydrator />
      {children}
      <GuestSubmissionFeedback />
    </LocaleProvider>
  );
}
