"use client";

import { Heart } from "lucide-react";
import { likeWish } from "@/lib/store";
import { Field } from "../SiteEdit";
import type { LayoutKit } from "../Site3DLayouts";

export function WishesCard({
  kit,
  tone,
}: {
  kit: LayoutKit;
  tone:
    | "luxury"
    | "elegant"
    | "modern"
    | "romantic"
    | "traditional"
    | "kyrgyz"
    | "mono"
    | "blush"
    | "frost"
    | "meadow"
    | "noir"
    | "stars"
    | "toiAnket"
    | "tuscany";
}) {
  const { labels, activeWish, wishes, slide, setSlide, setAllOpen, invitation, onReload, onChange } = kit;
  const title = {
    luxury: "font-lux text-center text-[28px] text-[#c4a35e]",
    elegant: "font-ele-script text-center text-[32px] text-[#4a3424]",
    modern: "font-mod text-center text-[22px] uppercase tracking-[-0.03em]",
    romantic: "font-rom text-center text-[34px] text-[#4a5340]",
    traditional: "font-tra-title text-center text-[26px] text-[#8a6230]",
    kyrgyz: "font-tra-title text-center text-[24px] text-[#8a6a35]",
    mono: "font-mod text-center text-[20px] uppercase tracking-[0.1em] text-[#1a1a1a]",
    blush: "font-ele-script text-center text-[30px] text-[#c98a86]",
    frost: "font-tra-title text-center text-[22px] uppercase tracking-[0.12em] text-[#5f7a94]",
    meadow: "font-lux text-center text-[26px] uppercase text-[#7a6a4a]",
    noir: "font-lux text-center text-[26px] text-[#7a1620]",
    stars: "font-mod text-center text-[20px] uppercase tracking-[0.12em] text-[#d4af67]",
    toiAnket: "font-tra-title text-center text-[22px] uppercase tracking-[0.1em] text-[#4a6a4e]",
    tuscany: "font-ele-script text-center text-[28px] text-[#8b5e34]",
  }[tone];
  const card = {
    luxury: "border border-[#c4a35e]/25 bg-[#1a1410] p-6 text-[#f3eadc]",
    elegant: "border border-[#3a2c20]/10 bg-white/70 p-6",
    modern: "border border-black p-5",
    romantic: "rounded-[28px] border border-[#6d7a5c]/20 bg-white p-6",
    traditional: "border border-[#b08948]/35 bg-[#fffaf1] p-6",
    kyrgyz: "border border-[#b8925a]/35 bg-[#fffaf3] p-6",
    mono: "rounded-none border border-[#1a1a1a]/15 bg-white p-6",
    blush: "rounded-[20px] border border-[#c98a86]/25 bg-white p-6",
    frost: "rounded-[10px] border border-[#5f7a94]/20 bg-white p-6",
    meadow: "rounded-none border border-[#7a6a4a]/20 bg-white p-6",
    noir: "rounded-none border border-[#7a1620]/20 bg-white p-6",
    stars: "rounded-[16px] border border-[#d4af67]/25 bg-[#161c34] p-6 text-[#eef0f6]",
    toiAnket: "rounded-[4px] border border-[#4a6a4e]/30 bg-white p-6",
    tuscany: "rounded-none border border-[#8b5e34]/25 bg-[#f7f2e8] p-6",
  }[tone];

  return (
    <section className="px-6 py-10">
      <Field invitation={invitation} onChange={onChange} id="wishes" fallback={labels.wishes} className={title} />
      {activeWish ? (
        <article className={`mx-auto mt-6 max-w-[340px] ${card}`}>
          <p className="text-[15px] leading-7">{activeWish.text}</p>
          <div className="mt-4 flex items-center justify-between gap-3 text-sm">
            <p className="font-medium">{activeWish.name}</p>
            <button
              type="button"
              onClick={() => {
                likeWish(invitation.id, activeWish.id);
                onReload?.();
              }}
              className="text-xs opacity-70"
            >
              <Heart size={12} className="mr-1 inline" /> {activeWish.likes}
            </button>
          </div>
        </article>
      ) : (
        <p className="mt-4 text-center text-sm opacity-40">—</p>
      )}
      {wishes.length > 1 ? (
        <div className="mt-4 flex justify-center gap-1.5">
          {wishes.map((w, i) => (
            <button
              key={w.id}
              type="button"
              onClick={() => setSlide(i)}
              className={`h-2 w-2 rounded-full ${i === slide % wishes.length ? "bg-current" : "bg-current/20"}`}
            />
          ))}
        </div>
      ) : null}
      {wishes.length > 0 ? (
        <button
          type="button"
          onClick={() => setAllOpen(true)}
          className="mx-auto mt-5 block text-[11px] uppercase tracking-[0.16em] underline underline-offset-4"
        >
          {labels.allWishes}
        </button>
      ) : null}
    </section>
  );
}
