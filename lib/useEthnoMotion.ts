"use client";

import { useEffect, type RefObject } from "react";

/** Animate text, preserving the editor's positioning on its wrapper. */
export function useEthnoMotion(root: RefObject<HTMLDivElement | null>, enabled: boolean) {
  useEffect(() => {
    const element = root.current;
    if (!enabled || !element || typeof IntersectionObserver === "undefined") return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const targets = Array.from(element.querySelectorAll<HTMLElement>("[data-wedding-text]"));
    let observer: IntersectionObserver | undefined;
    const reset = () => {
      observer?.disconnect();
      targets.forEach(target => {
        target.removeAttribute("data-ethno-reveal");
        target.style.removeProperty("--ethno-delay");
      });
    };
    const start = () => {
      reset();
      if (motion.matches) return;
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute("data-ethno-reveal", "visible");
          observer?.unobserve(entry.target);
        });
      }, { threshold: 0.08 });
      targets.forEach((target, index) => {
        target.style.setProperty("--ethno-delay", `${(index % 3) * 110}ms`);
        target.setAttribute("data-ethno-reveal", "pending");
        observer!.observe(target);
      });
    };
    start();
    motion.addEventListener("change", start);
    return () => { reset(); motion.removeEventListener("change", start); };
  }, [root, enabled]);
}
