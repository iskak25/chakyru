"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";
import { useEthnoMotion } from "@/lib/useEthnoMotion";
import css from "./InvitationMotion.module.css";

const MotionContext = createContext(false);
export function useInvitationMotion() { return useContext(MotionContext); }

export function InvitationMotion({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEthnoMotion(root, enabled);
  return <MotionContext.Provider value={enabled}>
    <div ref={root} className={css.root}>{children}</div>
  </MotionContext.Provider>;
}
