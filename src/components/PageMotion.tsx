"use client";

import { useEffect } from "react";

/**
 * Progressive enhancement only. Content is visible before JS, on reduced
 * motion devices, and if IntersectionObserver is unavailable.
 */
export default function PageMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".re-home");
    if (!root || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = Array.from(
      root.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    // Already-visible content should never flash hidden during hydration.
    const belowFold = targets.filter(
      (node) => node.getBoundingClientRect().top > window.innerHeight * 0.92,
    );
    belowFold.forEach((node) => node.classList.add("re-motion-pending"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const node = entry.target as HTMLElement;
          node.classList.remove("re-motion-pending");
          node.classList.add("re-motion-visible");
          observer.unobserve(node);
        });
      },
      { rootMargin: "0px 0px -5% 0px", threshold: 0.08 },
    );
    belowFold.forEach((node) => observer.observe(node));
    return () => {
      observer.disconnect();
      belowFold.forEach((node) => node.classList.remove("re-motion-pending"));
    };
  }, []);
  return null;
}
