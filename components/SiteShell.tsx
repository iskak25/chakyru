"use client";

import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function SiteShell({
  children,
  footer = true,
}: {
  children: ReactNode;
  footer?: boolean;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      {footer ? <Footer /> : null}
    </>
  );
}
