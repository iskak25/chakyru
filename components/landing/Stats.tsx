"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/locale";

type StatDef = {
  value: number;
  suffix: string;
  unit?: string;
  label: string;
};

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function useCountUp(target: number, active: boolean, duration = 1600) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * easeOutCubic(progress)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target, duration]);

  return value;
}

function StatCard({
  item,
  active,
  delay,
}: {
  item: StatDef;
  active: boolean;
  delay: number;
}) {
  const count = useCountUp(item.value, active);
  const display =
    item.value >= 1000 ? count.toLocaleString("ru-RU") : String(count);

  return (
    <article
      className={`chakyru-stat-card group rounded-[20px] bg-white px-3 py-6 text-center shadow-[0_12px_40px_rgba(28,24,20,0.06)] transition duration-500 min-[360px]:px-4 sm:rounded-[24px] sm:px-7 sm:py-10 ${
        active ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
      style={{
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      }}
    >
      <p
        className="font-serif text-[clamp(1.9rem,9vw,2.5rem)] font-normal leading-none tracking-[-0.03em] text-[#8B6A52] transition duration-300 group-hover:-translate-y-0.5 sm:text-[48px] lg:text-[56px]"
        aria-label={`${item.value}${item.suffix}${item.unit ? ` ${item.unit}` : ""}`}
      >
        <span aria-hidden="true">
          {display}
          {item.suffix}
          {item.unit ? (
            <span className="ml-1.5 text-[0.42em] font-sans font-normal tracking-normal text-[#8B6A52]/90">
              {item.unit}
            </span>
          ) : null}
        </span>
      </p>
      <p className="mx-auto mt-3 max-w-[14ch] text-[12px] leading-[1.4] text-[#6b635c] sm:mt-5 sm:max-w-[18ch] sm:text-[14px]">
        {item.label}
      </p>
    </article>
  );
}

export function Stats() {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { threshold: 0.28, rootMargin: "0px 0px -8% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  const items: StatDef[] = [
    { value: 5000, suffix: "+", label: t.stats.items[0] },
    { value: 25000, suffix: "+", label: t.stats.items[1] },
    { value: 98, suffix: "%", label: t.stats.items[2] },
    { value: 1, suffix: "", unit: t.stats.minute, label: t.stats.items[3] },
  ];

  return (
    <section
      ref={sectionRef}
      id="stats"
      aria-labelledby="stats-heading"
      className="bg-[#F8F6F2]"
    >
      <div className="mx-auto w-full max-w-[1280px] px-5 py-16 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
        <header className="mx-auto mb-12 max-w-[28rem] text-center sm:mb-16">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#8B6A52]">{t.stats.kicker}</p>
          <h2
            id="stats-heading"
            className="font-serif mt-3 text-[32px] font-normal leading-[1.1] tracking-[-0.03em] text-[#1a1714] sm:text-[42px] lg:text-[48px]"
          >
            {t.stats.title}
          </h2>
        </header>

        <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {items.map((item, i) => (
            <StatCard key={item.label} item={item} active={active} delay={i * 90} />
          ))}
        </div>
      </div>
    </section>
  );
}
