"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { INTRO_KEY } from "@/lib/intro";

type Phase = "closed" | "reveal" | "leaving";

/**
 * First-visit brand intro on the homepage.
 *
 * The inline script in layout.tsx marks <html data-intro="playing"> before
 * first paint, which covers the page and holds the hero's entrance. This
 * component plays the logo sequence, then wipes upward and clears the mark at
 * the same moment so the hero animates in as the curtain lifts.
 *
 * Plays once per session, never on other routes, never with reduced motion,
 * and can be skipped with the button or Escape.
 */
export default function BrandEntrance() {
  const [phase, setPhase] = useState<Phase>("closed");
  const timers = useRef<number[]>([]);
  const leaveRef = useRef<(fast?: boolean) => void>(() => {});

  useEffect(() => {
    const root = document.documentElement;
    if (root.getAttribute("data-intro") !== "playing") return;
    try {
      sessionStorage.setItem(INTRO_KEY, "seen");
    } catch {
      // Storage restrictions never block the page.
    }

    const later = (fn: () => void, ms: number) =>
      timers.current.push(window.setTimeout(fn, ms));
    const leave = (fast = false) => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      setPhase("leaving");
      // Releasing the hero as the wipe starts makes the two feel continuous.
      root.removeAttribute("data-intro");
      later(() => setPhase("closed"), fast ? 420 : 820);
    };

    later(() => setPhase("reveal"), 0);
    later(() => leave(), 1750);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") leave(true);
    };
    document.addEventListener("keydown", onKey);
    leaveRef.current = leave;
    return () => {
      timers.current.forEach(clearTimeout);
      document.removeEventListener("keydown", onKey);
      root.removeAttribute("data-intro");
    };
  }, []);

  if (phase === "closed") return null;

  return (
    <div
      className={`radiant-intro radiant-intro-${phase}`}
      role="dialog"
      aria-modal="false"
      aria-label="Welcome to Radiant Events Planning"
    >
      <div className="radiant-intro-center">
        <span className="radiant-intro-overline">Atlanta · Event planning &amp; design</span>
        <div className="radiant-intro-mark">
          <Image
            src="/brand/radiant-olive-logo.webp"
            alt="Radiant Events Planning"
            width={350}
            height={350}
            priority
            sizes="(max-width: 600px) 58vw, 260px"
          />
        </div>
        <div className="radiant-intro-rule" aria-hidden="true" />
        <p className="radiant-intro-tagline">
          <span>Planning with purpose.</span> <span>Serving with grace.</span>
        </p>
      </div>
      <button type="button" className="radiant-intro-skip" onClick={() => leaveRef.current(true)}>
        Skip intro <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
