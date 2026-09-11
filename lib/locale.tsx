"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { getDict, type Dictionary } from "./i18n";
import type { Locale } from "./types";

const KEY = "chakyru-locale";
const LOCALE_EVENT = "chakyru-locale-change";
let memoryLocale: Locale = "ky";
function readLocale(): Locale {
  try {
    const value = localStorage.getItem(KEY);
    return value === "ru" || value === "ky" ? value : memoryLocale;
  } catch { return memoryLocale; }
}
function subscribeLocale(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(LOCALE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(LOCALE_EVENT, onChange);
  };
}

type LocaleContextValue = {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribeLocale, readLocale, () => "ky" as Locale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    memoryLocale = next;
    try { localStorage.setItem(KEY, next); } catch { /* Keep the current choice when browser storage is unavailable. */ }
    window.dispatchEvent(new Event(LOCALE_EVENT));
  }, []);

  const value = useMemo(
    () => ({ locale, t: getDict(locale), setLocale }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useI18n must be used within LocaleProvider");
  return ctx;
}
