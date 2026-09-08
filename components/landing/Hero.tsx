"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/locale";
import { InvitationPhone } from "./InvitationPhone";

const HERO_BG =
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=2400&q=85";

export function Hero() {
  const { t, locale } = useI18n();
  const copy = t.creativeAds.home;

  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <img src={HERO_BG} alt="" className="absolute inset-0 h-full w-full object-cover object-[68%_42%]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(247,243,236,0.94)_0%,rgba(247,243,236,0.82)_38%,rgba(247,243,236,0.28)_62%,rgba(247,243,236,0.12)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_78%_55%,rgba(255,255,255,0.35),transparent_55%)]" />

      <div className="relative mx-auto grid min-h-[100svh] max-w-[1400px] grid-rows-[auto_1fr] items-start gap-8 px-5 pb-10 pt-28 sm:gap-10 sm:px-10 sm:pb-16 sm:pt-28 lg:grid-cols-[0.95fr_1.05fr] lg:grid-rows-none lg:items-center lg:gap-6 lg:px-14 lg:pb-20 lg:pt-24">
        <div className="max-w-[28rem]">
          <h1 className="whitespace-pre-line font-serif text-[clamp(2.5rem,12vw,3.25rem)] font-normal leading-[0.98] tracking-[-0.03em] text-black sm:text-[68px] lg:text-[80px]">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-[30ch] text-[15px] leading-[1.55] text-[#1a1a1a] sm:mt-6 sm:text-[17px] sm:leading-[1.7]">
            {copy.subtitle}
          </p>
          <Link
            href="/creativeads/templates"
            className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-black px-7 text-[15px] font-medium text-white shadow-[0_10px_28px_rgba(0,0,0,0.18)] transition hover:bg-[#1a1a1a]"
          >
            {copy.start}
            <ArrowRight size={16} strokeWidth={2} />
          </Link>
          <p className="mt-5 max-w-[32ch] text-[13px] leading-[1.7] text-[#1a1a1a]/70 sm:text-[14px]">
            {copy.detail}
          </p>
        </div>

        <div className="relative mx-auto flex w-full max-w-[520px] items-start justify-center lg:max-w-none lg:items-center">
          <div className="pointer-events-none absolute -right-[8%] top-[6%] h-[78%] w-[70%] rounded-full bg-white/25 blur-3xl" />
          <div
            className="relative z-10 w-[min(270px,68vw)] origin-center sm:w-[300px]"
            style={{ transform: "rotate(7deg) translateY(8px)" }}
          >
            <InvitationPhone featured>
              <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-[#f6f0e6] px-5 text-center">
                <div
                  className="pointer-events-none absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 20% 15%, rgba(168,142,110,0.25), transparent 40%), radial-gradient(circle at 80% 80%, rgba(168,142,110,0.18), transparent 45%)",
                  }}
                />
                <p className="relative text-[22px] leading-none text-[#c4ae91]">♛</p>
                <p className="font-script relative mt-5 text-[34px] leading-none text-[#2a241c]">Марк</p>
                <p className="font-script relative my-1 text-[22px] text-[#8a7a68]">&</p>
                <p className="font-script relative text-[34px] leading-none text-[#2a241c]">Раушан</p>
                <p className="relative mt-6 text-[9px] uppercase tracking-[0.28em] text-[#8a7a68]">
                  {locale === "ru" ? "Приглашение" : "Чакыруу"}
                </p>
                <div className="relative mt-8 h-px w-16 bg-[#c4ae91]/70" />
                <p className="relative mt-4 text-[10px] tracking-[0.18em] text-[#8a7a68]">12.10.2026</p>
              </div>
            </InvitationPhone>
          </div>
        </div>
      </div>
    </section>
  );
}
