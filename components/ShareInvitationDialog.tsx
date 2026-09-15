"use client";

import { useState } from "react";
import { AppDialog } from "./AppDialog";

export function ShareInvitationDialog({ invitationId, names, locale, onClose }: { invitationId: string; names: string; locale: string; onClose: () => void }) {
  const ru = locale === "ru";
  const url = `${window.location.origin}/i/${encodeURIComponent(invitationId)}`;
  const text = `${ru ? "Приглашение" : "Чакыруу"}${names ? ` · ${names}` : ""}`;
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  async function copy() {
    try { await navigator.clipboard.writeText(url); setCopied(true); setError(""); }
    catch { setError(ru ? "Выделите и скопируйте ссылку вручную ниже." : "Төмөндөгү шилтемени белгилеп, кол менен көчүрүңүз."); }
  }
  async function share() {
    try { await navigator.share({ title: text, text, url }); setError(""); }
    catch (err) { if (!(err instanceof Error && err.name === "AbortError")) setError(ru ? "Не удалось открыть приложения. Скопируйте ссылку." : "Тиркемелер ачылган жок. Шилтемени көчүрүңүз."); }
  }
  const linkClass = "flex min-h-12 items-center justify-center rounded-xl border bg-white px-4 py-3 text-sm hover:bg-cream";
  return <AppDialog title={ru ? "Поделиться приглашением" : "Чакыруу менен бөлүшүү"} onClose={onClose}>
    <p className="mt-4 text-sm leading-6">{ru ? "Выберите, куда отправить ссылку гостям." : "Конокторго шилтемени кайсы жерден жөнөтүүнү тандаңыз."}</p>
    <div className="my-6 grid grid-cols-2 gap-3">
      <a className={linkClass} target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`}>WhatsApp</a>
      <a className={linkClass} target="_blank" rel="noopener noreferrer" href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`}>Telegram</a>
      <a className={linkClass} target="_blank" rel="noopener noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}>Facebook</a>
      {typeof navigator.share === "function" ? <button className={linkClass} type="button" onClick={() => void share()}>{ru ? "Другие приложения" : "Башка тиркемелер"}</button> : <button className={linkClass} type="button" onClick={() => void copy()}>{ru ? "Копировать ссылку" : "Шилтемени көчүрүү"}</button>}
    </div>
    <label className="block text-sm">{ru ? "Ссылка для гостей" : "Коноктор үчүн шилтеме"}<input className="mt-2 w-full rounded-xl border bg-white p-3 text-sm" readOnly value={url} onFocus={e => e.currentTarget.select()} /></label>
    <button className="mt-4 w-full rounded-xl bg-[#302a25] p-3 text-sm text-white" type="button" onClick={() => void copy()}>{copied ? (ru ? "Ссылка скопирована" : "Шилтеме көчүрүлдү") : (ru ? "Копировать ссылку" : "Шилтемени көчүрүү")}</button>
    {copied && <p role="status" className="mt-3 text-sm">{ru ? "Теперь можно вставить её в сообщение гостям." : "Эми аны конокторго билдирүүгө кошсоңуз болот."}</p>}
    {error && <p role="alert" className="mt-3 text-sm">{error}</p>}
  </AppDialog>;
}
