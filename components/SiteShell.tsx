"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AppShell } from "./app/AppShell";

const MARKETING = new Set(["/", "/terms"]);

function shouldUseAppChrome(pathname: string) {
  if (MARKETING.has(pathname) || pathname.startsWith("/i/")) return false;
  if (pathname.startsWith("/create")) return false;
  if (pathname.startsWith("/admin")) return false;
  if (pathname.startsWith("/creativeads")) return false;
  if (pathname.startsWith("/pay")) return false;
  return true;
}

export function SiteShell({
  children,
  footer = true,
  forceMarketing = false,
}: {
  children: ReactNode;
  footer?: boolean;
  forceMarketing?: boolean;
}) {
  const pathname = usePathname();
  const appChrome = !forceMarketing && shouldUseAppChrome(pathname);

  if (appChrome) {
    return <AppShell>{children}</AppShell>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      {footer ? <Footer /> : null}
    </>
  );
}
