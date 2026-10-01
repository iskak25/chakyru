"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export const CANVAS_BASE_WIDTH = 390;

/**
 * На телефоне (<640px) всегда рендерит холст шириной 390px и уменьшает его
 * через transform: scale, чтобы переносы строк и положение элементов совпадали
 * с десктопом и гостевой страницей. На широких экранах — без изменений.
 */
export function ScaledCanvas({ children }: { children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [mobile, setMobile] = useState(false);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!mobile) return;
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const measure = () => {
      setScale(Math.min(1, (o.clientWidth - 32) / CANVAS_BASE_WIDTH));
      setHeight(i.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, [mobile]);

  if (!mobile) return <>{children}</>;

  return (
    <div
      ref={outer}
      // px-4/-mx-4: запас под маркеры у краёв; overflow-x-clip прячет layout-ширину 390px
      className="-mx-4 overflow-x-clip px-4"
      style={{ height: height != null ? height * scale : undefined }}
    >
      <div
        ref={inner}
        style={{
          width: CANVAS_BASE_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          marginLeft: `calc(50% - ${(CANVAS_BASE_WIDTH * scale) / 2}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
