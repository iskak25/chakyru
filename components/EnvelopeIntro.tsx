"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ENVELOPE_TIMING, envelopeVariants, type EnvelopeVariant } from "@/lib/envelopes";
import css from "./EnvelopeIntro.module.css";

function Ornament({ motif, className = "" }: { motif: string; className?: string }) {
  return <svg className={className} viewBox="0 0 160 80" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
    {motif === "ethno" ? <g><path d="M80 12 108 40 80 68 52 40Z M80 23 97 40 80 57 63 40Z"/><path d="M53 40H34c-24 0-24-25-9-25 15 0 15 17 4 17M53 40H34c-24 0-24 25-9 25 15 0 15-17 4-17M107 40h19c24 0 24-25 9-25-15 0-15 17-4 17M107 40h19c24 0 24 25 9 25-15 0-15-17-4-17"/></g>
      : motif === "stars" ? <g><path d="m80 12 5 22 22 6-22 5-5 23-5-23-22-5 22-6ZM28 25v20m-10-10h20m94 0v20m-10-10h20"/><circle cx="46" cy="58" r="1.5"/><circle cx="114" cy="19" r="1.5"/></g>
      : motif === "minimal" ? <g><path d="M22 40h40m36 0h40M80 25l15 15-15 15-15-15Z"/><circle cx="80" cy="40" r="5"/></g>
      : <g><path d="M80 66C49 58 34 37 36 14M80 66c31-8 46-29 44-52"/><path d="M39 30C23 29 22 18 23 15c12 1 17 7 16 15ZM45 43C27 44 25 35 25 31c12-1 19 4 20 12ZM58 55C40 61 35 52 34 48c12-5 21-1 24 7ZM121 30c16-1 17-12 16-15-12 1-17 7-16 15ZM115 43c18 1 20-8 20-12-12-1-19 4-20 12ZM102 55c18 6 23-3 24-7-12-5-21-1-24 7Z"/><path d="m80 24 5 9-5 9-5-9Z"/></g>}
  </svg>;
}

type Props = { variant: EnvelopeVariant; names: string; date: string; locale: string; children: ReactNode };

export function EnvelopeIntro({ variant, names, date, locale, children }: Props) {
  const [stage, setStage] = useState<"closed" | "opening" | "revealing" | "open">("closed");
  const [reduced, setReduced] = useState(false);
  const started = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const button = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const active = stage !== "open";
  const theme = envelopeVariants[variant];
  const ru = locale === "ru";
  const title = ru ? "Вам приглашение" : "Сизге чакыруу";
  const openLabel = ru ? "Открыть приглашение" : "Чакырууну ачуу";
  const initials = names.split(/\s*[&+/]\s*| менен | жана | и /i).filter(Boolean).slice(0, 2).map(s => Array.from(s.trim())[0]).join(" · ");
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T12:00:00`) : null;
  const displayDate = parsed && !Number.isNaN(parsed.getTime()) ? parsed.toLocaleDateString(ru ? "ru-RU" : "ky-KG", { day: "2-digit", month: "2-digit", year: "numeric" }) : date;
  const variables = Object.fromEntries(Object.entries(theme).filter(([key]) => key !== "motif").map(([key, value]) => [`--env-${key}`, value])) as CSSProperties;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (!active) {
      content.current?.focus({ preventScroll: true });
      content.current?.scrollIntoView({ block: "start", behavior: "instant" });
      return;
    }
    const root = document.documentElement, body = document.body;
    const rootOverflow = root.style.overflow, bodyOverflow = body.style.overflow, padding = body.style.paddingRight;
    const scrollbar = window.innerWidth - root.clientWidth;
    if (scrollbar > 0) body.style.paddingRight = `${parseFloat(getComputedStyle(body).paddingRight || "0") + scrollbar}px`;
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    button.current?.focus({ preventScroll: true });
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key === "Tab") { event.preventDefault(); button.current?.focus({ preventScroll: true }); }
    };
    document.addEventListener("keydown", trapFocus, true);
    return () => {
      root.style.overflow = rootOverflow;
      body.style.overflow = bodyOverflow;
      body.style.paddingRight = padding;
      document.removeEventListener("keydown", trapFocus, true);
    };
  }, [active]);

  function open() {
    if (started.current) return;
    started.current = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(reduce);
    setStage("opening");
    timers.current.push(setTimeout(() => setStage("revealing"), reduce ? ENVELOPE_TIMING.reducedReveal : ENVELOPE_TIMING.reveal));
    timers.current.push(setTimeout(() => setStage("open"), reduce ? ENVELOPE_TIMING.reducedComplete : ENVELOPE_TIMING.complete));
  }

  return <div className={css.experience} style={variables} data-envelope-experience={variant}>
    {(stage === "revealing" || stage === "open") && <div ref={content} tabIndex={-1} aria-label={title} inert={active} className={`${css.content} ${stage === "revealing" ? css.contentEntering : ""}`}>{children}</div>}
    {active && <section className={css.scene} data-envelope-intro={variant} data-stage={stage} data-reduced={reduced || undefined} role="dialog" aria-modal="true" aria-label={title}>
      <div className={css.light} aria-hidden="true"/>
      <header className={css.heading}><span className={css.eyebrow}>{ru ? "Особенный день · особенные люди" : "Өзгөчө күн · өзгөчө адамдар"}</span><h1>{title}</h1><p>{ru ? "Для вас. С теплом и любовью." : "Сиз үчүн. Жылуулук жана сүйүү менен."}</p></header>
      <div className={css.center}>
        <button ref={button} type="button" onClick={open} className={css.trigger} aria-label={openLabel} aria-disabled={started.current}>
          <span className={css.envelope} aria-hidden="true">
            <span className={css.back}/>
            <span className={css.lining}><Ornament motif={theme.motif}/></span>
            <span className={css.card}>
              <span className={css.cardBorder}/><Ornament motif={theme.motif} className={css.cardOrnament}/>
              <span className={css.cardTitle}>{ru ? "Приглашение" : "Чакыруу"}</span>
              <span className={css.cardNames}>{names}</span><span className={css.cardDate}>{displayDate}</span>
            </span>
            <span className={`${css.front} ${css.left}`}/><span className={`${css.front} ${css.right}`}/>
            <span className={`${css.front} ${css.bottom}`}><span className={css.address}>{ru ? "Лично для вас" : "Сиз үчүн"}</span><Ornament motif={theme.motif} className={css.frontOrnament}/></span>
            <span className={css.flap}><span className={css.flapOutside}><Ornament motif={theme.motif} className={css.flapOrnament}/></span><span className={css.flapInside}/></span>
            <span className={css.seal}><span className={css.sealRim}/><span className={css.monogram}>{initials || "♡"}</span></span>
          </span>
        </button>
      </div>
      <footer className={css.footer}><span className={css.hint}>{stage === "closed" ? (ru ? "Коснитесь печати, чтобы открыть" : "Ачуу үчүн мөөрдү басыңыз") : (ru ? "Открываем ваше приглашение…" : "Чакырууңуз ачылууда…")}</span><span className={css.footerDate}>{displayDate}</span></footer>
    </section>}
  </div>;
}
