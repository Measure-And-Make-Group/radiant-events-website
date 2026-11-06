"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const KEY = "radiant-cinematic-intro-2026-v1";
type Phase = "closed" | "reveal" | "leaving";

export default function BrandEntrance() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("closed");

  useEffect(() => {
    if (pathname !== "/") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (sessionStorage.getItem(KEY) === "seen") return;
      sessionStorage.setItem(KEY, "seen");
    } catch {
      // Storage restrictions never block navigation.
    }

    const opening = window.setTimeout(() => setPhase("reveal"), 0);
    const leaving = window.setTimeout(() => setPhase("leaving"), 1450);
    const finish = window.setTimeout(() => setPhase("closed"), 2120);
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPhase("closed");
    };
    document.addEventListener("keydown", dismiss);
    return () => {
      window.clearTimeout(opening);
      window.clearTimeout(leaving);
      window.clearTimeout(finish);
      document.removeEventListener("keydown", dismiss);
    };
  }, [pathname]);

  if (phase === "closed") return null;

  return (
    <div className={`radiant-intro radiant-intro-${phase}`} aria-label="Radiant Events Planning welcome">
      <div className="radiant-intro-panel" aria-hidden="true" />
      <div className="radiant-intro-center">
        <span className="radiant-intro-overline">THOUGHTFULLY DESIGNED · BEAUTIFULLY REMEMBERED</span>
        <div className="radiant-intro-mark">
          <Image
            src="/brand/radiant-olive-logo.webp"
            alt="Radiant Events Planning"
            width={350}
            height={350}
            priority
            sizes="(max-width: 600px) 58vw, 290px"
          />
        </div>
        <div className="radiant-intro-rule" aria-hidden="true" />
        <p>Planning with purpose. Serving with grace.</p>
      </div>
      <button type="button" className="radiant-intro-skip" onClick={() => setPhase("closed")} aria-label="Skip welcome animation">
        Skip intro <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}
