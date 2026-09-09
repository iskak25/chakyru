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
  tone:
    | "luxury"
    | "elegant"
    | "modern"
    | "romantic"
    | "traditional"
    | "ivory"
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
    kyrgyz: "h-12 w-full rounded-[4px] border border-[#b8925a]/45 bg-[#fffaf3] px-4 text-sm outline-none",
    mono: "h-12 w-full rounded-none border border-[#1a1a1a]/30 bg-transparent px-4 text-sm outline-none",
    blush: "h-12 w-full rounded-full border border-[#c98a86]/40 bg-white px-5 text-sm outline-none",
    frost: "h-12 w-full rounded-[4px] border border-[#5f7a94]/35 bg-white px-4 text-sm outline-none",
    meadow: "h-12 w-full rounded-none border border-[#7a6a4a]/35 bg-white px-4 text-sm outline-none",
    noir: "h-12 w-full rounded-none border border-[#7a1620]/35 bg-white px-4 text-sm text-[#241612] outline-none",
    stars: "h-12 w-full rounded-full border border-[#d4af67]/35 bg-[#161c34] px-5 text-sm text-[#eef0f6] outline-none placeholder:text-[#8892ac]",
    toiAnket: "h-12 w-full rounded-[4px] border border-[#4a6a4e]/40 bg-white px-4 text-sm outline-none",
    tuscany: "h-12 w-full rounded-none border border-[#8b5e34]/40 bg-[#f7f2e8] px-4 text-sm outline-none",
  }[tone];

  const optionCls = (active: boolean) =>
    ({
      luxury: `flex h-12 w-full items-center justify-between border px-4 text-left text-sm ${active ? "border-[#c4a35e] text-[#c4a35e]" : "border-white/15 text-[#f4efe6]/80"}`,
      elegant: `flex h-11 w-full items-center gap-3 border-b text-left text-sm ${active ? "border-[#3a2c20] font-medium" : "border-[#3a2c20]/15"}`,
      modern: `flex h-14 w-full items-center justify-between border px-4 text-sm uppercase tracking-[0.12em] ${active ? "bg-black text-white" : "border-black"}`,
      romantic: `flex h-12 w-full items-center gap-3 rounded-full border px-5 text-left text-sm ${active ? "border-[#6d7a5c] bg-[#6d7a5c]/10 text-[#4a5340]" : "border-[#6d7a5c]/25"}`,
      traditional: `flex h-12 w-full items-center gap-3 border px-4 text-left text-sm ${active ? "border-[#b08948] bg-[#b08948]/10" : "border-[#b08948]/30"}`,
      ivory: `flex h-12 w-full items-center gap-3 rounded-full border px-5 text-left text-sm ${active ? "border-[#e2c2b9] bg-[#e2c2b9]/25" : "border-[#e2c2b9]/50"}`,
      kyrgyz: `flex h-12 w-full items-center gap-3 rounded-[4px] border px-4 text-left text-sm ${active ? "border-[#2f4a3a] bg-[#2f4a3a]/10 text-[#2f4a3a]" : "border-[#b8925a]/35"}`,
      mono: `flex h-12 w-full items-center justify-between rounded-none border px-4 text-left text-sm ${active ? "border-[#1a1a1a] bg-[#1a1a1a] text-white" : "border-[#1a1a1a]/25 text-[#1a1a1a]"}`,
      blush: `flex h-12 w-full items-center gap-3 rounded-full border px-5 text-left text-sm ${active ? "border-[#c98a86] bg-[#c98a86]/15 text-[#3a2c28]" : "border-[#c98a86]/30 text-[#3a2c28]"}`,
      frost: `flex h-12 w-full items-center gap-3 rounded-[4px] border px-4 text-left text-sm ${active ? "border-[#5f7a94] bg-[#5f7a94]/10 text-[#2c3a48]" : "border-[#5f7a94]/25 text-[#2c3a48]"}`,
      meadow: `flex h-12 w-full items-center gap-3 rounded-none border px-4 text-left text-sm ${active ? "border-[#7a6a4a] bg-[#7a6a4a]/10 text-[#2c261c]" : "border-[#7a6a4a]/25 text-[#2c261c]"}`,
      noir: `flex h-12 w-full items-center gap-3 rounded-none border px-4 text-left text-sm ${active ? "border-[#7a1620] bg-[#7a1620]/10 text-[#7a1620]" : "border-[#7a1620]/25 text-[#241612]"}`,
      stars: `flex h-12 w-full items-center gap-3 rounded-full border px-5 text-left text-sm ${active ? "border-[#d4af67] bg-[#d4af67]/15 text-[#d4af67]" : "border-[#d4af67]/25 text-[#eef0f6]"}`,
      toiAnket: `flex h-12 w-full items-center gap-3 rounded-[4px] border px-4 text-left text-sm ${active ? "border-[#4a6a4e] bg-[#4a6a4e]/10 text-[#243020]" : "border-[#4a6a4e]/30 text-[#243020]"}`,
      tuscany: `flex h-12 w-full items-center gap-3 rounded-none border px-4 text-left text-sm ${active ? "border-[#8b5e34] bg-[#8b5e34]/10 text-[#3a2c1c]" : "border-[#8b5e34]/30 text-[#3a2c1c]"}`,
    })[tone];

  const submit = {
    luxury: "mt-4 flex h-12 w-full items-center justify-center bg-[#c4a35e] text-[11px] uppercase tracking-[0.22em] text-[#16110c]",
    elegant: "mt-6 flex h-12 w-full items-center justify-center border border-[#3a2c20] text-[11px] uppercase tracking-[0.2em]",
    modern: "mt-4 flex h-14 w-full items-center justify-center bg-black text-[12px] uppercase tracking-[0.18em] text-white",
    romantic: "mt-4 flex h-12 w-full items-center justify-center rounded-full bg-[#6d7a5c] text-[12px] tracking-[0.12em] text-white",
    traditional: "mt-4 flex h-12 w-full items-center justify-center bg-[#8a6230] text-[11px] uppercase tracking-[0.16em] text-[#fff8ec]",
    ivory: "fam-ivory-btn mt-4 flex h-12 w-full items-center justify-center rounded-full bg-[#e2c2b9] text-[11px] uppercase tracking-[0.16em] text-[#2a1f1c]",
    kyrgyz: "mt-4 flex h-12 w-full items-center justify-center rounded-[4px] bg-[#2f4a3a] text-[11px] uppercase tracking-[0.18em] text-[#fdf8ee]",
    mono: "mt-4 flex h-12 w-full items-center justify-center rounded-none bg-[#1a1a1a] text-[11px] uppercase tracking-[0.2em] text-white",
    blush: "mt-4 flex h-12 w-full items-center justify-center rounded-full bg-[#c98a86] text-[11px] uppercase tracking-[0.18em] text-white",
    frost: "mt-4 flex h-12 w-full items-center justify-center rounded-[4px] bg-[#5f7a94] text-[11px] uppercase tracking-[0.16em] text-white",
    meadow: "mt-4 flex h-12 w-full items-center justify-center rounded-none bg-[#7a6a4a] text-[11px] uppercase tracking-[0.18em] text-white",
    noir: "mt-4 flex h-12 w-full items-center justify-center rounded-none bg-[#7a1620] text-[11px] uppercase tracking-[0.16em] text-[#f5f0e8]",
    stars: "mt-4 flex h-12 w-full items-center justify-center rounded-full bg-[#d4af67] text-[11px] uppercase tracking-[0.2em] text-[#0d1224]",
    toiAnket: "mt-4 flex h-12 w-full items-center justify-center rounded-[4px] bg-[#4a6a4e] text-[11px] uppercase tracking-[0.16em] text-[#f5faf3]",
    tuscany: "mt-4 flex h-12 w-full items-center justify-center rounded-none bg-[#8b5e34] text-[11px] uppercase tracking-[0.18em] text-[#f7f2e8]",
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
