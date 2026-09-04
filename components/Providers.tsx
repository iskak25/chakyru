"use client";

import { useEffect } from "react";
import { LocaleProvider } from "@/lib/locale";
import { CatalogHydrator } from "./CatalogHydrator";
import { FirebaseSession } from "./FirebaseSession";

function DebugRuntimeProbe() {
  useEffect(() => {
    // #region agent log
    fetch("http://127.0.0.1:7861/ingest/fdb6035a-9503-48b4-894a-ead00d842d89", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "c008f9" },
      body: JSON.stringify({
        sessionId: "c008f9",
        hypothesisId: "D",
        location: "Providers.tsx:mount",
        message: "app mounted",
        data: { href: window.location.href, path: window.location.pathname },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    const onErr = (event: ErrorEvent) => {
      fetch("http://127.0.0.1:7861/ingest/fdb6035a-9503-48b4-894a-ead00d842d89", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "c008f9" },
        body: JSON.stringify({
          sessionId: "c008f9",
          hypothesisId: "D",
          location: "Providers.tsx:error",
          message: "window error",
          data: { msg: event.message, src: event.filename, line: event.lineno },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    };
    const onRej = (event: PromiseRejectionEvent) => {
      fetch("http://127.0.0.1:7861/ingest/fdb6035a-9503-48b4-894a-ead00d842d89", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "c008f9" },
        body: JSON.stringify({
          sessionId: "c008f9",
          hypothesisId: "D",
          location: "Providers.tsx:unhandled",
          message: "unhandled rejection",
          data: { reason: String(event.reason) },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    };
    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRej);
    return () => {
      window.removeEventListener("error", onErr);
      window.removeEventListener("unhandledrejection", onRej);
    };
    // #endregion
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <DebugRuntimeProbe />
      <FirebaseSession />
      <CatalogHydrator />
      {children}
    </LocaleProvider>
  );
}
