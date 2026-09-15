"use client";
import { useState, type FormEvent } from "react";
import { MessageSquare } from "lucide-react";
import { guestFetch } from "@/lib/guestSubmission";
import { AppDialog } from "./AppDialog";
import css from "./GuestWishForm.module.css";

export function GuestWishForm({ invitationId, locale }: { invitationId: string; locale: string }) {
  const ru = locale === "ru";
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [open, setOpen] = useState(false);
  const preview = invitationId === "demo" || invitationId === "preview" || invitationId.startsWith("preview-");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending" || !name.trim() || !text.trim() || preview) return;
    setState("sending");
    try {
      await guestFetch(`/api/invitations/${encodeURIComponent(invitationId)}/wish`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), text: text.trim() }),
      }, false);
      setText(""); setState("sent");
    } catch { setState("error"); }
  }
  return <>
    <button type="button" data-export-hide aria-haspopup="dialog" onClick={() => { if (state !== "sending") setState("idle"); setOpen(true); }} className={css.trigger}><MessageSquare size={21} /><span>{ru ? "ПОЖЕЛАНИЕ" : "КААЛОО"}</span></button>
    {open && <AppDialog title={state === "sent" ? (ru ? "Спасибо!" : "Рахмат!") : (ru ? "Напишите пожелание" : "Каалооңузду жазыңыз")} onClose={() => setOpen(false)} className={css.dialog}>
      {state === "sent" ? <div className={css.success}><p role="status">{ru ? "Ваше пожелание отправлено хозяевам праздника." : "Каалооңуз той ээлерине жөнөтүлдү."}</p><button type="button" onClick={() => setOpen(false)} className={css.submit}>{ru ? "Готово" : "Даяр"}</button></div> : <form className={css.form} onSubmit={submit}>
        <label>{ru ? "Ваше имя" : "Атыңыз"}<input required maxLength={120} autoComplete="name" placeholder={ru ? "Напишите ваше имя" : "Атыңызды жазыңыз"} value={name} onChange={e => setName(e.target.value)} disabled={state === "sending"} /></label>
        <label>{ru ? "Ваше пожелание" : "Жакшы каалооңузду жазыңыз"}<textarea required maxLength={2000} rows={5} placeholder={ru ? "Напишите пожелание…" : "Каалооңузду жазыңыз…"} value={text} onChange={e => setText(e.target.value)} disabled={state === "sending"} /></label>
        <button type="submit" disabled={preview || state === "sending" || !name.trim() || !text.trim()} className={css.submit}>{state === "sending" ? (ru ? "Отправляем…" : "Жөнөтүлүүдө…") : (ru ? "Отправить" : "Жөнөтүү")}</button>
        {preview && <p>{ru ? "В предпросмотре пожелания не отправляются." : "Алдын ала көрүүдө каалоолор жөнөтүлбөйт."}</p>}
        {state === "error" && <p role="alert">{ru ? "Не удалось отправить. Текст сохранён — попробуйте ещё раз." : "Жөнөтүлгөн жок. Текст сакталды — кайра аракет кылыңыз."}</p>}
      </form>}
    </AppDialog>}
  </>;
}
