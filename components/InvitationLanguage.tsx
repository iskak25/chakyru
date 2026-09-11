"use client";

import { createContext, useContext, type ReactNode } from "react";

const InvitationLanguage = createContext<string | null>(null);
export function InvitationLanguageProvider({ locale, children }: { locale: string; children: ReactNode }) {
  return <InvitationLanguage.Provider value={locale}>{children}</InvitationLanguage.Provider>;
}
export function useInvitationLanguage() { return useContext(InvitationLanguage); }
