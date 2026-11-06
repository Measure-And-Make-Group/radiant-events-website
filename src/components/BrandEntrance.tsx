"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const KEY = "radiant-home-welcome-2026-v4";
export default function BrandEntrance() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (pathname !== "/" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (sessionStorage.getItem(KEY) === "seen") return;
      sessionStorage.setItem(KEY, "seen");
    } catch {
      // Welcome is purely decorative; unavailable storage must never block content.
    }
    const show = window.setTimeout(() => setVisible(true), 0);
    const hide = window.setTimeout(() => setVisible(false), 1350);
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") setVisible(false);
    };
    document.addEventListener("keydown", dismiss);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
      document.removeEventListener("keydown", dismiss);
    };
  }, [pathname]);
  if (!visible) return null;
  return (
    <div className="brand-intro brand-intro-refined" aria-label="Welcome to Radiant Events">
      <Image
        src="/brand/radiant-olive-logo.webp"
        alt="Radiant Events Planning"
        width={440}
        height={440}
        priority
        sizes="(max-width: 600px) 72vw, 360px"
      />
      <p>Beauty without the burden.</p>
      <button type="button" onClick={() => setVisible(false)}>Skip welcome</button>
    </div>
  );
}
