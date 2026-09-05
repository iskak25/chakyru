"use client";

import type { InviteFamily } from "@/lib/inviteFamilies";
import type { LayoutKit } from "../Site3DLayouts";
import { ElegantFamily } from "./Elegant";
import { IvoryFamily } from "./Ivory";
import { LuxuryFamily } from "./Luxury";
import { MauveFamily } from "./Mauve";
import { ModernFamily } from "./Modern";
import { RomanticFamily } from "./Romantic";
import { TraditionalFamily } from "./Traditional";

export function FamilyLayout({ family, kit }: { family: InviteFamily; kit: LayoutKit }) {
  if (family === "luxury") return <LuxuryFamily kit={kit} />;
  if (family === "modern") return <ModernFamily kit={kit} />;
  if (family === "romantic") return <RomanticFamily kit={kit} />;
  if (family === "traditional") return <TraditionalFamily kit={kit} />;
  if (family === "ivory") return <IvoryFamily kit={kit} />;
  if (family === "mauve") return <MauveFamily kit={kit} />;
  return <ElegantFamily kit={kit} />;
}

export function FamilyThumb({
  family,
  a,
  b,
  heroPhoto,
}: {
  family: InviteFamily;
  a: string;
  b: string;
  heroPhoto: string;
}) {
  if (family === "luxury") {
    return (
      <div className="relative h-full overflow-hidden bg-[#120e0c] text-[#c4a35e]">
        <img src={heroPhoto} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="relative flex h-full flex-col items-center justify-end px-4 pb-8 text-center">
          <p className="text-[8px] uppercase tracking-[0.28em]">Invitation</p>
          <p className="font-lux mt-2 text-[22px] leading-tight text-[#f7efe3]">{a}</p>
          <p className="font-lux text-[22px] leading-tight text-[#f7efe3]">{b}</p>
        </div>
      </div>
    );
  }
  if (family === "modern") {
    return (
      <div className="flex h-full flex-col justify-end bg-white px-4 pb-7 text-black">
        <p className="mb-auto pt-8 text-[8px] uppercase tracking-[0.2em] text-black/40">Save the date</p>
        <p className="font-mod text-[30px] uppercase leading-[0.82]">{a}</p>
        <p className="font-mod my-1 text-[14px] tracking-[0.3em] text-black/30">/</p>
        <p className="font-mod text-[30px] uppercase leading-[0.82]">{b}</p>
      </div>
    );
  }
  if (family === "romantic") {
    return (
      <div className="relative h-full overflow-hidden bg-[#fbf7f2]">
        <div className="fam-rom-arch h-[72%] overflow-hidden">
          <img src={heroPhoto} alt="" className="h-full w-full object-cover" />
        </div>
        <p className="font-rom px-3 pt-3 text-center text-[22px] leading-tight text-[#4a5340]">
          {a} ♥ {b}
        </p>
      </div>
    );
  }
  if (family === "traditional") {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[#f4efe4] px-4 text-center text-[#6a441c]">
        <div className="fam-tra-border flex h-[86%] w-[86%] flex-col items-center justify-center px-3">
          <p className="font-tra-script text-[26px] leading-tight">{a}</p>
          <p className="my-1 text-[12px]">&</p>
          <p className="font-tra-script text-[26px] leading-tight">{b}</p>
        </div>
      </div>
    );
  }
  if (family === "ivory") {
    return (
      <div className="relative h-full overflow-hidden bg-[#fcfaf9]">
        <img src={heroPhoto} alt="" className="h-[58%] w-full object-cover" />
        <div className="px-3 pt-4 text-center">
          <p className="font-ivory text-[20px] uppercase leading-none">
            {a} <span className="text-[#e2c2b9]">&</span> {b}
          </p>
        </div>
      </div>
    );
  }
  if (family === "mauve") {
    return (
      <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-[#fdf8f5] px-4 text-center">
        <p className="font-mauve text-[22px] uppercase leading-none">{a}</p>
        <p className="font-ivory-script my-2 text-[16px] text-[#9f7e7e]">и</p>
        <p className="font-mauve text-[22px] uppercase leading-none">{b}</p>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col items-center justify-center bg-[#f7f1e8] px-4 text-center">
      <p className="text-[9px] uppercase tracking-[0.24em] text-[#8b5e34]">Save the date</p>
      <p className="font-ele-script mt-3 text-[24px] leading-tight text-[#4a3424]">
        {a} & {b}
      </p>
      <span className="mt-4 h-px w-10 bg-[#8b5e34]/30" />
    </div>
  );
}
