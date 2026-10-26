"use client";

import { useState } from "react";
import { AppDialog } from "./AppDialog";
import { buildShareMessage } from "@/lib/shareMessage";
import { cleanGuestName } from "@/lib/personalInvite";
import type { Invitation } from "@/lib/types";

type ShareProps = { invitation: Invitation; locale: string; onClose: () => void; personal?: boolean };

/** Содержимое окна «Поделиться»: имя гостя, текст, мессенджеры и ссылка. Используется и в окне, и на открытой странице. */
export function ShareInvitationPanel({ invitation, locale, personal = false }: Omit<ShareProps, "onClose">) {
  const ru = locale === "ru";
  const [linkLang, setLinkLang] = useState<"ru" | "ky">(ru ? "ru" : "ky");
  const [guest, setGuest] = useState("");
  const guestName = cleanGuestName(guest);
  // Именная ссылка: /i/<имя>/<id>. Без имени — обычная /i/<id>.
  const linkFor = (lang: string, name: string) => `${window.location.origin}/i/${name ? `${encodeURIComponent(name)}/` : ""}${encodeURIComponent(invitation.id)}?lang=${lang}`;
  const url = linkFor(linkLang, guestName);
  const [text, setText] = useState(buildShareMessage(invitation, locale, url));

  function pickLang(next: "ru" | "ky") {
    setLinkLang(next);
    setText(buildShareMessage(invitation, next, linkFor(next, guestName), guestName));
  }
  function pickGuest(value: string) {
    setGuest(value);
    const name = cleanGuestName(value);
    setText(buildShareMessage(invitation, linkLang, linkFor(linkLang, name), name));
  }
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
  return <>
    <div className="mt-4 grid grid-cols-2 gap-2" role="group" aria-label={ru ? "Язык ссылки" : "Шилтеменин тили"}>
      {(["ru", "ky"] as const).map(l => (
        <button key={l} type="button" aria-pressed={linkLang === l} onClick={() => pickLang(l)}
          className={`min-h-11 rounded-xl border px-3 text-sm ${linkLang === l ? "bg-[#302a25] text-white" : "bg-white hover:bg-cream"}`}>
          {l === "ru" ? "Русский" : "Кыргызча"}
        </button>
      ))}
    </div>
    <label className="mt-4 block text-sm">{ru ? "Имя гостя (именное приглашение)" : "Коноктун аты (жеке чакыруу)"}
      <input className="mt-2 w-full rounded-xl border bg-white p-3 text-sm" value={guest} maxLength={60} autoFocus={personal}
        placeholder={ru ? "Например: Айгерим" : "Мисалы: Айгерим"} onChange={e => pickGuest(e.target.value)} />
    </label>
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
  </>;
}

export function ShareInvitationDialog({ onClose, ...props }: ShareProps) {
  return <AppDialog title={props.locale === "ru" ? "Поделиться приглашением" : "Чакыруу менен бөлүшүү"} onClose={onClose}><ShareInvitationPanel {...props} /></AppDialog>;
}
