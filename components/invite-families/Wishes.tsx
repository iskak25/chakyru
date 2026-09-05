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
  tone: "luxury" | "elegant" | "modern" | "romantic" | "traditional";
}) {
  const { labels, activeWish, wishes, slide, setSlide, setAllOpen, invitation, onReload, onChange } = kit;
  const title = {
    luxury: "font-lux text-center text-[28px] text-[#c4a35e]",
    elegant: "font-ele-script text-center text-[32px] text-[#4a3424]",
    modern: "font-mod text-center text-[22px] uppercase tracking-[-0.03em]",
    romantic: "font-rom text-center text-[34px] text-[#4a5340]",
    traditional: "font-tra-title text-center text-[26px] text-[#8a6230]",
  }[tone];
  const card = {
    luxury: "border border-[#c4a35e]/25 bg-[#1a1410] p-6 text-[#f3eadc]",
    elegant: "border border-[#3a2c20]/10 bg-white/70 p-6",
    modern: "border border-black p-5",
    romantic: "rounded-[28px] border border-[#6d7a5c]/20 bg-white p-6",
    traditional: "border border-[#b08948]/35 bg-[#fffaf1] p-6",
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
