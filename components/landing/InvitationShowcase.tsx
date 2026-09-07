"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { showcaseInvitations } from "@/lib/showcaseInvitations";
import { useI18n } from "@/lib/locale";
import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";
import { InvitationPreview } from "./InvitationPreview";

const COUNT = showcaseInvitations.length;
const AUTOPLAY_MS = 3400;

export function InvitationShowcase() {
  const { t } = useI18n();
  const [active, setActive] = useState(1);
  const [paused, setPaused] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const moved = useRef(false);
  const resumeTimer = useRef<number | null>(null);

  const goTo = useCallback((index: number) => {
    setActive(((index % COUNT) + COUNT) % COUNT);
  }, []);

  const step = useCallback((dir: -1 | 1) => {
    setActive((current) => ((current + dir) % COUNT + COUNT) % COUNT);
  }, []);

  const pauseBriefly = useCallback(() => {
    setPaused(true);
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => setPaused(false), 6000);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        pauseBriefly();
        step(-1);
      }
      if (e.key === "ArrowRight") {
        pauseBriefly();
        step(1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pauseBriefly, step]);

  useEffect(() => {
    if (paused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = window.setInterval(() => step(1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, step]);

  useEffect(() => {
    return () => {
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    };
  }, []);

  function onPointerDown(clientX: number) {
    touchStartX.current = clientX;
    moved.current = false;
    setPaused(true);
  }

  function onPointerMove(clientX: number) {
    if (touchStartX.current == null) return;
    if (Math.abs(clientX - touchStartX.current) > 18) moved.current = true;
  }

  function onPointerUp(clientX: number) {
    if (touchStartX.current == null) return;
    const startX = touchStartX.current;
    const delta = clientX - startX;
    touchStartX.current = null;

    if (Math.abs(delta) >= 42) {
      step(delta < 0 ? 1 : -1);
      pauseBriefly();
      return;
    }

    // Tap / click: left side → prev, right side → next
    if (!moved.current) {
      const rect = stageRef.current?.getBoundingClientRect();
      if (rect) {
        const ratio = (clientX - rect.left) / rect.width;
        if (ratio < 0.38) {
          step(-1);
          pauseBriefly();
          return;
        }
        if (ratio > 0.62) {
          step(1);
          pauseBriefly();
          return;
        }
      }
    }
    pauseBriefly();
  }

  return (
    <section className="bg-page pb-16 sm:pb-24">
      <Container>
        <Reveal>
          <h2 className="font-serif mx-auto max-w-[16ch] text-center text-[32px] font-normal leading-[1.08] tracking-[-0.03em] sm:text-[44px] lg:text-[52px]">
            {t.inviteShowcase.title}
          </h2>
          <p className="mx-auto mt-5 max-w-[40ch] text-center text-[15px] leading-[1.85] text-ink-soft">
            {t.inviteShowcase.subtitle}
          </p>
        </Reveal>
      </Container>

      <div
        className="invite-coverflow mt-10 lg:mt-14"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => {
          touchStartX.current = null;
          setPaused(false);
        }}
        onTouchStart={(e) => onPointerDown(e.changedTouches[0].clientX)}
        onTouchMove={(e) => onPointerMove(e.changedTouches[0].clientX)}
        onTouchEnd={(e) => onPointerUp(e.changedTouches[0].clientX)}
        onMouseDown={(e) => onPointerDown(e.clientX)}
        onMouseMove={(e) => onPointerMove(e.clientX)}
        onMouseUp={(e) => onPointerUp(e.clientX)}
      >
        <div ref={stageRef} className="invite-coverflow-stage">
          {showcaseInvitations.map((invitation, i) => {
            const offset = coverflowOffset(i, active, COUNT);
            return (
              <div
                key={invitation.id}
                className={`invite-coverflow-card ${offset === 0 ? "is-active" : ""}`}
                style={coverflowStyle(offset)}
                aria-hidden={offset !== 0}
              >
                <InvitationPreview invitation={invitation} featured={offset === 0} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-3 sm:mt-8">
        <button
          type="button"
          className="invite-nav-btn"
          aria-label="Previous"
          onClick={() => {
            pauseBriefly();
            step(-1);
          }}
        >
          ‹
        </button>
        <div className="flex items-center gap-2">
          {showcaseInvitations.map((invitation, i) => (
            <button
              key={invitation.id}
              type="button"
              className={`invite-dot ${i === active ? "is-active" : ""}`}
              aria-label={`${invitation.groom} & ${invitation.bride}`}
              aria-current={i === active ? "true" : undefined}
              onClick={() => {
                goTo(i);
                pauseBriefly();
              }}
            />
          ))}
        </div>
        <button
          type="button"
          className="invite-nav-btn"
          aria-label="Next"
          onClick={() => {
            pauseBriefly();
            step(1);
          }}
        >
          ›
        </button>
      </div>
    </section>
  );
}

function coverflowOffset(index: number, active: number, count: number) {
  let offset = index - active;
  if (offset > count / 2) offset -= count;
  if (offset < -count / 2) offset += count;
  return offset;
}

function coverflowStyle(offset: number): CSSProperties {
  const abs = Math.abs(offset);
  if (abs > 1) {
    return {
      opacity: 0,
      pointerEvents: "none",
      transform: `translate3d(${offset * 70}%, 0, -240px) rotateY(${offset * -40}deg) scale(0.7)`,
      zIndex: 0,
    };
  }
  if (offset === 0) {
    return {
      opacity: 1,
      pointerEvents: "none",
      transform: "translate3d(0, 0, 60px) rotateY(0deg) scale(1)",
      zIndex: 30,
    };
  }
  const side = offset < 0 ? -1 : 1;
  return {
    opacity: 0.82,
    pointerEvents: "none",
    transform: `translate3d(${side * 52}%, 0, -60px) rotateY(${side * -34}deg) scale(0.84)`,
    zIndex: 20 - abs,
  };
}
