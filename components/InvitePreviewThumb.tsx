"use client";

import { useEffect, useRef, useState } from "react";
import type { Invitation } from "@/lib/types";
import { FormatInvite } from "./FormatInvite";
import { Skeleton } from "./Skeleton";

const BASE_WIDTH = 430;

/** Live, non-interactive miniature of the real invitation, scaled to fit its container width. */
export function InvitePreviewThumb({ invitation, locale }: { invitation: Invitation; locale: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / BASE_WIDTH);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={box} className="pointer-events-none absolute inset-0 overflow-hidden bg-page" aria-hidden="true">
      {scale ? (
        <div style={{ width: BASE_WIDTH, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <FormatInvite invitation={{ ...invitation, music: false }} locale={locale} compact />
        </div>
      ) : (
        <Skeleton className="h-full w-full !rounded-none" />
      )}
    </div>
  );
}
