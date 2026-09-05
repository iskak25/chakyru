"use client";

import { addRsvp } from "@/lib/store";
import type { RsvpStatus } from "@/lib/types";
import { fieldValue } from "../SiteEdit";
import type { LayoutKit } from "../Site3DLayouts";

export function RsvpForm({
  kit,
  tone,
}: {
  kit: LayoutKit;
  tone: "luxury" | "elegant" | "modern" | "romantic" | "traditional" | "ivory";
}) {
  const { variant, onChange, labels, invitation, rsvp, setRsvp, rsvpName, setRsvpName, rsvpDone, setRsvpDone, onReload } = kit;
  if (variant !== "guest" && !onChange) return null;
  const options = (
    [
      ["yes", fieldValue(invitation, "rsvpYes", labels.rsvpYes)],
      ["no", fieldValue(invitation, "rsvpNo", labels.rsvpNo)],
      ["maybe", fieldValue(invitation, "rsvpPlus", labels.rsvpPlus)],
    ] as [RsvpStatus, string][]
  );

  const input = {
    luxury: "h-12 w-full border border-[#c4a35e]/40 bg-transparent px-4 text-sm text-[#f4efe6] outline-none placeholder:text-[#f4efe6]/40",
    elegant: "h-12 w-full rounded-none border-b border-[#3a2c20]/25 bg-transparent px-1 text-sm outline-none",
    modern: "h-14 w-full rounded-none border border-black bg-white px-4 text-sm outline-none",
    romantic: "h-12 w-full rounded-full border border-[#6d7a5c]/30 bg-white px-5 text-sm outline-none",
    traditional: "h-12 w-full rounded-sm border border-[#b08948]/50 bg-[#fffaf1] px-4 text-sm outline-none",
    ivory: "h-12 w-full rounded-full border border-[#e2c2b9] bg-white px-5 text-sm outline-none",
  }[tone];

  const optionCls = (active: boolean) =>
    ({
      luxury: `flex h-12 w-full items-center justify-between border px-4 text-left text-sm ${active ? "border-[#c4a35e] text-[#c4a35e]" : "border-white/15 text-[#f4efe6]/80"}`,
      elegant: `flex h-11 w-full items-center gap-3 border-b text-left text-sm ${active ? "border-[#3a2c20] font-medium" : "border-[#3a2c20]/15"}`,
      modern: `flex h-14 w-full items-center justify-between border px-4 text-sm uppercase tracking-[0.12em] ${active ? "bg-black text-white" : "border-black"}`,
      romantic: `flex h-12 w-full items-center gap-3 rounded-full border px-5 text-left text-sm ${active ? "border-[#6d7a5c] bg-[#6d7a5c]/10 text-[#4a5340]" : "border-[#6d7a5c]/25"}`,
      traditional: `flex h-12 w-full items-center gap-3 border px-4 text-left text-sm ${active ? "border-[#b08948] bg-[#b08948]/10" : "border-[#b08948]/30"}`,
      ivory: `flex h-12 w-full items-center gap-3 rounded-full border px-5 text-left text-sm ${active ? "border-[#e2c2b9] bg-[#e2c2b9]/25" : "border-[#e2c2b9]/50"}`,
    })[tone];

  const submit = {
    luxury: "mt-4 flex h-12 w-full items-center justify-center bg-[#c4a35e] text-[11px] uppercase tracking-[0.22em] text-[#16110c]",
    elegant: "mt-6 flex h-12 w-full items-center justify-center border border-[#3a2c20] text-[11px] uppercase tracking-[0.2em]",
    modern: "mt-4 flex h-14 w-full items-center justify-center bg-black text-[12px] uppercase tracking-[0.18em] text-white",
    romantic: "mt-4 flex h-12 w-full items-center justify-center rounded-full bg-[#6d7a5c] text-[12px] tracking-[0.12em] text-white",
    traditional: "mt-4 flex h-12 w-full items-center justify-center bg-[#8a6230] text-[11px] uppercase tracking-[0.16em] text-[#fff8ec]",
    ivory: "fam-ivory-btn mt-4 flex h-12 w-full items-center justify-center rounded-full bg-[#e2c2b9] text-[11px] uppercase tracking-[0.16em] text-[#2a1f1c]",
  }[tone];

  if (variant !== "guest") {
    return <p className="text-sm opacity-60">{labels.rsvpHint}</p>;
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!rsvpName.trim()) return;
        addRsvp(invitation.id, rsvpName.trim(), rsvp, rsvp === "maybe" ? 1 : 0);
        setRsvpDone(true);
        onReload?.();
      }}
    >
      <input
        required
        value={rsvpName}
        onChange={(e) => setRsvpName(e.target.value)}
        placeholder={labels.yourName}
        className={input}
      />
      {options.map(([key, label]) => (
        <button key={key} type="button" onClick={() => setRsvp(key)} className={optionCls(rsvp === key)}>
          <span>{label}</span>
        </button>
      ))}
      <button type="submit" className={submit}>
        {fieldValue(invitation, "rsvpSend", labels.rsvpSend)}
      </button>
      {rsvpDone ? <p className="pt-2 text-sm opacity-70">{labels.rsvpThanks}</p> : null}
    </form>
  );
}
