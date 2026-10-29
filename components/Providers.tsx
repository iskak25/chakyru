"use client";

import { LocaleProvider } from "@/lib/locale";
import dynamic from "next/dynamic";
import { GuestSubmissionFeedback } from "./GuestSubmissionFeedback";

// Firebase is large and only needed for the signed-in session, so it loads after the first paint.
// CatalogHydrator тоже тянет firebase/firestore (~160 КБ gzip): статический импорт клал его в бандл каждой страницы.
const CatalogHydrator = dynamic(() => import("./CatalogHydrator").then((m) => m.CatalogHydrator), { ssr: false });
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
