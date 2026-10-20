"use client";

import { useEffect, type RefObject } from "react";

/** Animate text, preserving the editor's positioning on its wrapper. */
export function useEthnoMotion(root: RefObject<HTMLDivElement | null>, enabled: boolean) {
  useEffect(() => {
    const element = root.current;
    if (!enabled || !element || typeof IntersectionObserver === "undefined") return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const targets = new Set<HTMLElement>();
    const selector = "[data-wedding-text], [data-invite-text], h1, h2, h3, p";
    let observer: IntersectionObserver | undefined;
    const reset = () => {
      observer?.disconnect();
      targets.forEach(target => {
        target.removeAttribute("data-ethno-reveal");
        target.style.removeProperty("--ethno-delay");
      });
      targets.clear();
    };
    const observeNewText = () => {
      if (motion.matches || !observer) return;
      element.querySelectorAll<HTMLElement>(selector).forEach(target => {
        // Animate a text block once, never its nested lines or interactive form copy.
        if (targets.has(target) || target.parentElement?.closest(selector) || target.closest("form, [data-export-hide], [contenteditable=true]")) return;
        if (!target.textContent?.trim()) return;
        target.style.setProperty("--ethno-delay", `${(targets.size % 3) * 110}ms`);
        targets.add(target);
        target.setAttribute("data-ethno-reveal", "pending");
        observer?.observe(target);
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
      observeNewText();
    };
    start();
    // Covers content mounted after opening an envelope or loading an invitation.
    const mutations = new MutationObserver(observeNewText);
    mutations.observe(element, { childList: true, subtree: true });
    motion.addEventListener("change", start);
    return () => { mutations.disconnect(); reset(); motion.removeEventListener("change", start); };
  }, [root, enabled]);
}
