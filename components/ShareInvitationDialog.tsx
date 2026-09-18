"use client";

import { useState } from "react";
import { AppDialog } from "./AppDialog";
import { buildShareMessage } from "@/lib/shareMessage";
import type { Invitation } from "@/lib/types";

export function ShareInvitationDialog({ invitation, locale, onClose }: { invitation: Invitation; locale: string; onClose: () => void }) {
  const ru = locale === "ru";
  const url = `${window.location.origin}/i/${encodeURIComponent(invitation.id)}`;
  const [text, setText] = useState(buildShareMessage(invitation, locale, url));
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function copyText() {
    try { await navigator.clipboard.writeText(text); setCopied(true); setError(""); }
    catch { setError(ru ? "Выделите и скопируйте текст вручную ниже." : "Төмөндөгү текстти белгилеп, кол менен көчүрүңүз."); }
  }

  async function copyLink() {
    try { await navigator.clipboard.writeText(url); setCopied(true); setError(""); }
    catch { setError(ru ? "Выделите и скопируйте ссылку вручную ниже." : "Төмөндөгү шилтемени белгилеп, кол менен көчүрүңүз."); }
  }

  async function shareInstagram() {
    if (typeof navigator.share === "function") {
      try { await navigator.share({ text }); setError(""); return; }
      catch (err) { if (err instanceof Error && err.name === "AbortError") return; }
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    } catch {
      setError(ru ? "Скопируйте текст выше и вставьте его в Instagram." : "Жогорудагы текстти көчүрүп, Instagram'га чаптаңыз.");
    }
  }

  const linkClass = "flex min-h-12 items-center justify-center rounded-xl border bg-white px-4 py-3 text-sm hover:bg-cream";
  return <AppDialog title={ru ? "Поделиться приглашением" : "Чакыруу менен бөлүшүү"} onClose={onClose}>
    <p className="mt-4 text-sm leading-6">{ru ? "Текст можно отредактировать перед отправкой." : "Жөнөтөр алдында текстти оңдой аласыз."}</p>
    <textarea
      className="mt-3 w-full rounded-xl border bg-white p-3 text-sm leading-6"
      rows={11}
      value={text}
      onChange={e => setText(e.target.value)}
    />
    <div className="my-4 grid grid-cols-2 gap-3">
      <a className={linkClass} target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${encodeURIComponent(text)}`}>WhatsApp</a>
      <a className={linkClass} target="_blank" rel="noopener noreferrer" href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`}>Telegram</a>
      <button className={linkClass} type="button" onClick={() => void shareInstagram()}>Instagram</button>
      <button className={linkClass} type="button" onClick={() => void copyText()}>{ru ? "Скопировать" : "Көчүрүү"}</button>
    </div>
    <label className="block text-sm">{ru ? "Ссылка для гостей" : "Коноктор үчүн шилтеме"}<input className="mt-2 w-full rounded-xl border bg-white p-3 text-sm" readOnly value={url} onFocus={e => e.currentTarget.select()} /></label>
    <button className="mt-4 w-full rounded-xl bg-[#302a25] p-3 text-sm text-white" type="button" onClick={() => void copyLink()}>{ru ? "Копировать ссылку" : "Шилтемени көчүрүү"}</button>
    {copied && <p role="status" className="mt-3 text-sm">{ru ? "Скопировано — теперь можно вставить в сообщение гостям." : "Көчүрүлдү — эми аны конокторго билдирүүгө кошсоңуз болот."}</p>}
    {error && <p role="alert" className="mt-3 text-sm">{error}</p>}
  </AppDialog>;
}
