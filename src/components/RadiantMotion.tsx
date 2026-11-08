"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * One motion system for every page (progressive enhancement only).
 *
 * Elements opt in with `data-reveal` (homepage and new sections) or are
 * picked up from the interior-page selectors below. Variants:
 *   data-reveal=""       rise and fade (default)
 *   data-reveal="mask"   image reveal: clipped from the bottom, settles in scale
 *   data-reveal="fade"   opacity only
 *   data-reveal="lines"  children with .rm-line rise one line at a time
 *   data-reveal="stagger" direct children rise in sequence
 *
 * Content is always visible without JavaScript, with reduced motion, and
 * without IntersectionObserver. Anything already scrolled past (fast flings,
 * anchor jumps, restored scroll position) is revealed immediately, so a
 * section can never be left blank above the reader.
 */
const INTERIOR = [
  [".page-hero .section-wrap", "lines"],
  [".rm-hero-media", "mask"],
  [".story-split .story-image", "mask"],
  [".story-split > div:not(.story-image)", ""],
  [".work-card", ""],
  [".occasion-card", ""],
  [".faq-category", ""],
  [".values-grid", "stagger"],
  [".closing-cta", "lines"],
  [".contact-layout > aside", "fade"],
  [".rs-section", ""],
  [".rs-photo", "mask"],
] as const;

export default function RadiantMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const main = document.getElementById("main-content");
    if (!main || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    for (const [selector, variant] of INTERIOR) {
      main.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        if (!el.hasAttribute("data-reveal")) el.setAttribute("data-reveal", variant);
      });
    }

    const fold = window.innerHeight * 0.92;
    const pending = Array.from(main.querySelectorAll<HTMLElement>("[data-reveal]")).filter(
      (el) => el.getBoundingClientRect().top > fold,
    );
    pending.forEach((el) => el.classList.add("rm-pending"));
    document.documentElement.classList.add("rm-ready");

    const reveal = (el: Element) => {
      if (!el.classList.contains("rm-pending")) return;
      el.classList.remove("rm-pending");
      el.classList.add("rm-in");
      observer.unobserve(el);
    };
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && reveal(e.target)),
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );
    pending.forEach((el) => observer.observe(el));

    // Catch-up for anything the observer skipped while scrolling quickly.
    let frame = 0;
    const catchUp = () => {
      frame = 0;
      for (const el of pending) {
        if (el.classList.contains("rm-pending") && el.getBoundingClientRect().top < window.innerHeight * 0.9)
          reveal(el);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(catchUp);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      pending.forEach((el) => el.classList.remove("rm-pending", "rm-in"));
    };
  }, [pathname]);

  return null;
}
