"use client";
import { useEffect, useRef, type ReactNode } from "react";
export default function Template({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    let frame = 0;
    const scroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const distance = document.documentElement.scrollHeight - innerHeight;
        document.documentElement.style.setProperty(
          "--reading-progress",
          String(distance > 0 ? Math.min(1, scrollY / distance) : 0),
        );
        frame = 0;
      });
    };
    const setup = () => {
      observer?.disconnect();
      window.removeEventListener("scroll", scroll);
      if (media.matches) {
        el.classList.remove("motion-enabled");
        return;
      }
      el.classList.add("motion-enabled");
      observer = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("has-entered");
              observer?.unobserve(entry.target);
            }
          }),
        { threshold: 0.08 },
      );
      el.querySelectorAll("[data-enter]").forEach((node) =>
        observer?.observe(node),
      );
      window.addEventListener("scroll", scroll, { passive: true });
      scroll();
    };
    setup();
    media.addEventListener("change", setup);
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scroll);
      media.removeEventListener("change", setup);
      document.documentElement.style.removeProperty("--reading-progress");
    };
  }, []);
  return (
    <div ref={root} className="page-experience">
      {children}
    </div>
  );
}
