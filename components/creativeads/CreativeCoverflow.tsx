"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Item = { id: string; node: ReactNode };

export function CreativeCoverflow({
  items,
  onActiveChange,
}: {
  items: Item[];
  onActiveChange?: (index: number) => void;
}) {
  const count = items.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const moved = useRef(false);
  const resumeTimer = useRef<number | null>(null);

  const goTo = useCallback(
    (index: number) => {
      if (!count) return;
      const next = ((index % count) + count) % count;
      setActive(next);
      onActiveChange?.(next);
    },
    [count, onActiveChange],
  );

  const step = useCallback(
    (dir: -1 | 1) => {
      if (!count) return;
      setActive((current) => {
        const next = ((current + dir) % count + count) % count;
        onActiveChange?.(next);
        return next;
      });
    },
    [count, onActiveChange],
  );

  const pauseBriefly = useCallback(() => {
    setPaused(true);
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => setPaused(false), 5000);
  }, []);

  useEffect(() => {
    if (!count) return;
    if (paused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => step(1), 3600);
    return () => window.clearInterval(id);
  }, [count, paused, step]);

  useEffect(() => {
    return () => {
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (active >= count && count > 0) goTo(0);
  }, [active, count, goTo]);

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
    const delta = clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) >= 42) {
      step(delta < 0 ? 1 : -1);
      pauseBriefly();
      return;
    }
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

  if (!count) return null;

  return (
    <div className="ca-coverflow">
      <div
        className="ca-coverflow-viewport"
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
        <div ref={stageRef} className="ca-coverflow-stage">
          {items.map((item, i) => {
            const offset = coverflowOffset(i, active, count);
            return (
              <div
                key={item.id}
                className={`ca-coverflow-card ${offset === 0 ? "is-active" : ""}`}
                style={coverflowStyle(offset)}
                aria-hidden={offset !== 0}
              >
                {item.node}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button type="button" className="ca-nav-btn" aria-label="Previous" onClick={() => { pauseBriefly(); step(-1); }}>
          ‹
        </button>
        <div className="flex items-center gap-2">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className={`ca-dot ${i === active ? "is-active" : ""}`}
              aria-label={`Show ${i + 1}`}
              aria-current={i === active ? "true" : undefined}
              onClick={() => {
                goTo(i);
                pauseBriefly();
              }}
            />
          ))}
        </div>
        <button type="button" className="ca-nav-btn" aria-label="Next" onClick={() => { pauseBriefly(); step(1); }}>
          ›
        </button>
      </div>
    </div>
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
      transform: `translate3d(${offset * 62}%, 0, -220px) rotateY(${offset * -36}deg) scale(0.72)`,
      zIndex: 0,
    };
  }
  if (offset === 0) {
    return {
      opacity: 1,
      pointerEvents: "none",
      transform: "translate3d(0, 0, 48px) rotateY(0deg) scale(1)",
      zIndex: 30,
    };
  }
  const side = offset < 0 ? -1 : 1;
  return {
    opacity: 0.78,
    pointerEvents: "none",
    transform: `translate3d(${side * 48}%, 0, -48px) rotateY(${side * -30}deg) scale(0.86)`,
    zIndex: 20 - abs,
  };
}
