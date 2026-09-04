"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/locale";
import { demoInvitation, getInvitation } from "@/lib/store";
import type { Invitation } from "@/lib/types";
import { FormatInvite } from "../FormatInvite";
import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";

const SHOWCASE_ID = "47cbb465-dc98-482a-b025-a0f4b04688fd";

function loadShowcase(): Invitation {
  return getInvitation(SHOWCASE_ID) ?? { ...demoInvitation, templateId: "ak-shumkar" };
}

export function Showcase() {
  const { locale, t } = useI18n();
  const [inv, setInv] = useState<Invitation | null>(null);

  function reload() {
    setInv(loadShowcase());
  }

  useEffect(() => {
    reload();
    window.addEventListener("chakyru-sync", reload);
    return () => window.removeEventListener("chakyru-sync", reload);
  }, []);

  return (
    <section className="bg-cream-deep">
      <Container className="py-20 sm:py-28">
        <Reveal>
          <p className="text-center font-serif text-[32px] leading-[1.15] tracking-[-0.02em] sm:text-[44px] lg:text-right lg:text-[52px]">
            {t.learn.title}
          </p>
        </Reveal>
        <Reveal delay={80} className="mt-12 flex justify-center sm:mt-16">
          <div className="relative w-full max-w-[360px] overflow-hidden border border-ink/15 bg-[#f7f3ec]">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-ink/10" />
            <div className="overflow-hidden">
              {inv ? (
                <FormatInvite invitation={inv} locale={locale} onReload={reload} />
              ) : (
                <div className="min-h-[480px] bg-[#f7f3ec]" />
              )}
            </div>
          </div>
        </Reveal>
        <p className="mt-10 text-center text-[10px] uppercase tracking-[0.28em] text-meta">
          {t.place}
        </p>
      </Container>
    </section>
  );
}
