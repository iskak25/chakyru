"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function Reveal({
  children,
  className = "",
  instant,
}: {
  children: ReactNode;
  className?: string;
  instant?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(!!instant);

  useEffect(() => {
    if (instant) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShown(true);
        io.disconnect();
      },
      { threshold: 0.2, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [instant]);

  return (
    <div ref={ref} className={`fam-reveal ${instant || shown ? "is-in" : ""} ${className}`}>
      {children}
    </div>
  );
}
