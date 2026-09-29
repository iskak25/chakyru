"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Invitation, Wish } from "@/lib/types";
import { setWishHiddenRemote } from "@/lib/accessClient";
import type { InvitePatch } from "./CanvasEdit";
import css from "./PinterestInvite.module.css";

export function WishesCarousel({ invitation, ru, editable, onChange }: { invitation: Invitation; ru: boolean; editable: boolean; onChange?: InvitePatch }) {
  const all = invitation.wishes || [];
  const shown = editable ? all : all.filter((w) => !w.hidden);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);
  const count = shown.length;
  const current = shown[count ? index % count : 0];
  const tr = (a: string, b: string) => (ru ? a : b);

  useEffect(() => {
    if (count < 2 || open) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => window.clearInterval(timer);
  }, [count, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function toggle(wish: Wish) {
    const hidden = !wish.hidden;
    setError(false);
    const ok = await setWishHiddenRemote(invitation.id, wish.id, hidden);
    if (!ok) return setError(true);
    onChange?.({ wishes: all.map((w) => (w.id === wish.id ? { ...w, hidden } : w)) });
  }

  if (!count) {
    return <p className={css.wishEmpty}>{tr("Здесь появятся пожелания от гостей", "Бул жерде коноктордун каалоолору пайда болот")}</p>;
  }

  return (
    <>
      <button type="button" className={`${css.wishCard} ${current.hidden ? css.wishDim : ""}`} onClick={() => setOpen(true)}>
        <p>{current.text}</p>
        <b>{current.name}</b>
      </button>
      {count > 1 ? <div className={css.wishDots}>{shown.map((w, i) => <i key={w.id} className={i === index % count ? css.on : ""} />)}</div> : null}
      <button type="button" className={css.wishAll} onClick={() => setOpen(true)}>{tr("Все пожелания", "Бардык каалоолор")} ({count})</button>
      {open ? createPortal(
        <div className={css.wishOverlay} onClick={() => setOpen(false)}>
          <div className={css.wishModal} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className={css.wishHead}>
              <span>{tr("Пожелания гостей", "Коноктордун каалоолору")}</span>
              <button type="button" aria-label="close" onClick={() => setOpen(false)}>×</button>
            </div>
            <div className={css.wishList}>
              {editable ? <p style={{ font: "12px/1.4 sans-serif", opacity: 0.65, margin: "10px 0 0" }}>{tr("Скрытые пожелания гости не увидят.", "Жашырылган каалоолорду конокторго көрүнбөйт.")}</p> : null}
              {error ? <p role="alert" style={{ font: "12px sans-serif", color: "#b42318" }}>{tr("Не удалось сохранить. Войдите и попробуйте ещё раз.", "Сакталган жок. Кирип, кайра аракет кылыңыз.")}</p> : null}
              {shown.map((w) => (
                <div key={w.id} className={`${css.wishRow} ${w.hidden ? css.wishHidden : ""}`}>
                  <strong>{w.name}</strong>
                  <small>{new Date(w.createdAt).toLocaleDateString(ru ? "ru-RU" : "ky-KG")}</small>
                  <p>{w.text}</p>
                  {editable ? <button type="button" onClick={() => void toggle(w)}>{w.hidden ? tr("Показать гостям", "Конокторго көрсөтүү") : tr("Скрыть от гостей", "Конокторго жашыруу")}</button> : null}
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
