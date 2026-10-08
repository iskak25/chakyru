"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ENVELOPE_TIMING, envelopeDesignPalette, type EnvelopeDesign, type EnvelopeVariant, type EnvelopeColors } from "@/lib/envelopes";
import css from "./EnvelopeIntro.module.css";

function Ornament({ motif, className = "" }: { motif: string; className?: string }) {
  return <svg className={className} viewBox="0 0 160 80" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
    {motif === "ethno" ? <g><path d="M80 12 108 40 80 68 52 40Z M80 23 97 40 80 57 63 40Z"/><path d="M53 40H34c-24 0-24-25-9-25 15 0 15 17 4 17M53 40H34c-24 0-24 25-9 25 15 0 15-17 4-17M107 40h19c24 0 24-25 9-25-15 0-15 17-4 17M107 40h19c24 0 24 25 9 25-15 0-15-17-4-17"/></g>
      : motif === "stars" ? <g><path d="m80 12 5 22 22 6-22 5-5 23-5-23-22-5 22-6ZM28 25v20m-10-10h20m94 0v20m-10-10h20"/><circle cx="46" cy="58" r="1.5"/><circle cx="114" cy="19" r="1.5"/></g>
      : motif === "minimal" ? <g><path d="M22 40h40m36 0h40M80 25l15 15-15 15-15-15Z"/><circle cx="80" cy="40" r="5"/></g>
      : <g><path d="M80 66C49 58 34 37 36 14M80 66c31-8 46-29 44-52"/><path d="M39 30C23 29 22 18 23 15c12 1 17 7 16 15ZM45 43C27 44 25 35 25 31c12-1 19 4 20 12ZM58 55C40 61 35 52 34 48c12-5 21-1 24 7ZM121 30c16-1 17-12 16-15-12 1-17 7-16 15ZM115 43c18 1 20-8 20-12-12-1-19 4-20 12ZM102 55c18 6 23-3 24-7-12-5-21-1-24 7Z"/><path d="m80 24 5 9-5 9-5-9Z"/></g>}
  </svg>;
}

function Flowers() {
  return <svg className={css.flowers} viewBox="0 0 160 600" fill="none" aria-hidden="true">
    <path d="M48 574C145 433 12 340 94 209S58 100 116 20M62 503C30 457 22 427 29 391M80 389C133 345 132 298 129 271M63 266C25 223 24 188 30 165" stroke="var(--env-foil)" strokeWidth="2"/>
    {Array.from({ length: 18 }, (_, i) => {
      const y = 40 + i * 29, x = 78 + Math.sin(i * .7) * 26;
      return <g key={i} transform={`translate(${x} ${y}) rotate(${i % 2 ? -28 : 25})`}>
        <path d="M0 18C-33 8-30-15-27-23 0-15 5 0 0 18Z" fill="var(--env-lining)" opacity=".65"/>
        <path d="M0 18C29 2 25-19 20-25-2-12-7 5 0 18Z" fill="var(--env-lining)" opacity=".4"/>
        <path d="M-22-16 0 18 17-17" stroke="var(--env-light)" strokeWidth=".7"/>
        {i % 3 === 1 && <g transform="translate(-10 8)">{[0,72,144,216,288].map(angle => <ellipse key={angle} cy="-9" rx="5.5" ry="11" transform={`rotate(${angle})`} fill="var(--env-lining)" stroke="var(--env-light)" strokeWidth=".8"/>)}<circle r="3" fill="var(--env-foil)"/></g>}
        <circle cx="34" cy="-12" r="2.4" fill="var(--env-foil)"/><path d="m4 20 30-32" stroke="var(--env-foil)"/>
      </g>;
    })}
  </svg>;
}

function PortraitDoors({ floral }: { floral: boolean }) {
  return <>
    <span className={`${css.door} ${css.doorRight}`}><svg className={css.doorPaper} viewBox="0 0 360 640" preserveAspectRatio="none"><path d={floral ? "M0 0H90Q128 0 125 30Q155 29 150 59Q178 61 165 90Q188 98 173 125Q190 138 181 160V480Q190 502 173 515Q188 542 165 550Q178 579 150 581Q155 611 125 610Q128 640 90 640H0Z" : "M0 0H360V640H0Z"} fill="var(--env-paper)" stroke="var(--env-shade)" strokeWidth="1.5"/></svg>{floral && <Flowers/>}</span>
    <span className={`${css.door} ${css.doorLeft}`}><svg className={css.doorPaper} viewBox="0 0 360 640" preserveAspectRatio="none"><path d={floral ? "M0 0H90Q128 0 125 30Q155 29 150 59Q178 61 165 90Q188 98 173 125Q190 138 181 160V480Q190 502 173 515Q188 542 165 550Q178 579 150 581Q155 611 125 610Q128 640 90 640H0Z" : "M0 0H280C350 78 211 151 271 247S226 350 287 451 264 580 216 596L205 640H0Z"} fill="var(--env-paper)" stroke="var(--env-shade)" strokeWidth="1.5"/></svg>{floral && <Flowers/>}</span>
    {floral && <span className={css.ribbon}><span className={css.ribbonBand}/><span className={css.bowTail}/><span className={css.bowTailRight}/><span className={css.bowLeft}/><span className={css.bowRight}/></span>}
  </>;
}

type Props = { variant: EnvelopeVariant; design?: EnvelopeDesign; colors?: EnvelopeColors; names: string; date: string; locale: string; children: ReactNode; embedded?: boolean; onOpen?: () => void; onOpened?: () => void };

export function EnvelopeIntro({ variant, design = "classic", colors, names, date, locale, children, embedded = false, onOpen, onOpened }: Props) {
  const [stage, setStage] = useState<"closed" | "opening" | "revealing" | "open">("closed");
  const [reduced, setReduced] = useState(false);
  const started = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const button = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const active = stage !== "open";
  const theme = { ...envelopeDesignPalette(design, variant), ...colors };
  const ru = locale === "ru";
  const title = ru ? "Вам приглашение" : "Сизге чакыруу";
  const openLabel = ru ? "Открыть приглашение" : "Чакырууну ачуу";
  const initials = names.split(/\s*[&+/]\s*| менен | жана | и /i).filter(Boolean).slice(0, 2).map(s => Array.from(s.trim())[0]).join(" · ");
  const displayDate = date.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$3.$2.$1");
  const variables = Object.fromEntries(Object.entries(theme).filter(([key]) => key !== "motif").map(([key, value]) => [`--env-${key}`, value])) as CSSProperties;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (embedded) {
      if (!active) content.current?.focus({ preventScroll: true });
      return;
    }
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
  }, [active, embedded]);

  function open() {
    if (started.current) return;
    started.current = true;
    onOpen?.();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(reduce);
    setStage("opening");
    timers.current.push(setTimeout(() => setStage("revealing"), reduce ? ENVELOPE_TIMING.reducedReveal : ENVELOPE_TIMING.reveal));
    timers.current.push(setTimeout(() => { setStage("open"); onOpened?.(); }, reduce ? ENVELOPE_TIMING.reducedComplete : ENVELOPE_TIMING.complete));
  }

  return <div className={`${css.experience} ${embedded ? css.embedded : ""}`} style={variables} data-envelope-experience={variant}>
    {(stage === "revealing" || stage === "open") && <div ref={content} tabIndex={-1} aria-label={title} inert={active} className={`${css.content} ${stage === "revealing" ? css.contentEntering : ""}`}>{children}</div>}
    {active && <section className={css.scene} data-envelope-intro={variant} data-envelope-design={design} data-stage={stage} data-reduced={reduced || undefined} role={embedded ? undefined : "dialog"} aria-modal={embedded ? undefined : true} aria-label={title}>
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
            {design !== "classic" && <PortraitDoors floral={design === "floral"}/>}
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
