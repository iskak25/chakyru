"use client";

import { useState, type FormEvent } from "react";

export function GuestWishForm({ invitationId, locale }: { invitationId: string; locale: string }) {
  const ru = locale === "ru";
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const preview = invitationId === "demo" || invitationId.startsWith("preview-");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending" || !name.trim() || !text.trim() || preview) return;
    setState("sending");
    try {
      const response = await fetch(`/api/invitations/${encodeURIComponent(invitationId)}/wish`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), text: text.trim() }),
      });
      if (!response.ok) throw new Error("save");
      const result = await response.json();
      if (!result.wish?.id) throw new Error("save");
      setText(""); setState("sent");
    } catch { setState("error"); }
  }
  return <section id="guest-wishes" className="mx-auto max-w-md border-t border-[var(--line)] bg-[#faf8f3] px-6 py-12 text-[#302a25]">
    <h2 className="font-serif text-center text-3xl">{ru ? "Пожелание от вас" : "Сиздин каалоо-тилегиңиз"}</h2>
    <p className="mt-3 text-center text-sm">{ru ? "Оставьте тёплые слова хозяевам праздника." : "Той ээлерине жылуу каалоо-тилегиңизди калтырыңыз."}</p>
    <form className="mt-7 space-y-4" onSubmit={submit}>
      <label className="block text-sm">{ru ? "Ваше имя" : "Атыңыз"}<input required maxLength={120} autoComplete="name" value={name} onChange={e => setName(e.target.value)} className="mt-2 block w-full rounded-xl border bg-white p-3" disabled={state === "sending"} /></label>
      <label className="block text-sm">{ru ? "Ваше пожелание" : "Каалоо-тилегиңиз"}<textarea required maxLength={2000} rows={5} value={text} onChange={e => setText(e.target.value)} className="mt-2 block w-full resize-y rounded-xl border bg-white p-3" disabled={state === "sending"} /></label>
      <button type="submit" disabled={preview || state === "sending" || !name.trim() || !text.trim()} className="w-full rounded-xl bg-[#302a25] px-5 py-3 text-sm text-white disabled:opacity-50">{state === "sending" ? (ru ? "Отправляем…" : "Жөнөтүлүүдө…") : (ru ? "Отправить пожелание" : "Каалоону жөнөтүү")}</button>
      {preview && <p className="text-sm">{ru ? "В предпросмотре пожелания не отправляются." : "Алдын ала көрүүдө каалоолор жөнөтүлбөйт."}</p>}
      {state === "sent" && <p role="status" className="text-sm">{ru ? "Спасибо! Ваше пожелание отправлено." : "Рахмат! Каалооңуз жөнөтүлдү."}</p>}
      {state === "error" && <p role="alert" className="text-sm">{ru ? "Не удалось отправить. Текст сохранён в форме — попробуйте ещё раз." : "Жөнөтүлгөн жок. Текст формада калды — кайра аракет кылыңыз."}</p>}
    </form>
  </section>;
}
