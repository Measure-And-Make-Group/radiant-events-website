"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Lightweight reveal effects across internal pages. Content always renders
 * without JavaScript and remains fully visible with reduced motion. */
export default function InteriorMotion() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/" || pathname === "/services") return;
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const main = document.getElementById("main-content");
    if (!main) return;
    const candidates = Array.from(main.querySelectorAll<HTMLElement>(
      ".page-hero .section-wrap, .occasion-card, .work-card, .story-split, .faq-category, .closing-cta > h2, .contact-layout > aside, .contact-layout > form, .values-grid > div",
    ));
    const pending = candidates.filter((el) =>
      el.getBoundingClientRect().top > window.innerHeight * 0.9
    );
    pending.forEach((el) => el.classList.add("interior-motion-pending"));
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const node = entry.target as HTMLElement;
        node.classList.remove("interior-motion-pending");
        observer.unobserve(node);
      }
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
    pending.forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      pending.forEach((el) => el.classList.remove("interior-motion-pending"));
    };
  }, [pathname]);
  return null;
}
