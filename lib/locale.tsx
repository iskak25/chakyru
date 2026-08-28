"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getDict, type Dictionary } from "./i18n";
import type { Locale } from "./types";

const KEY = "chakyru-locale";

type LocaleContextValue = {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ky");

  useEffect(() => {
    const saved = localStorage.getItem(KEY) as Locale | null;
    if (saved === "ky" || saved === "ru") setLocaleState(saved);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(KEY, next);
    document.documentElement.lang = next;
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
