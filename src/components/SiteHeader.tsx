"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/lib/site-config";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isCurrent = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>("a, button");
    focusable?.[0]?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="site-header sticky top-0 z-50 bg-cream-light/95 backdrop-blur border-b border-taupe/40">
      <div className="header-inner">
        <Link
          href="/"
          className="header-brand"
          aria-label="Radiant Events Planning, home"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/brand/radiant-olive-logo.webp"
            alt=""
            width={46}
            height={46}
            className="header-emblem"
            priority
          />
          <span className="header-wordmark">
            Radiant Events<small>PLANNING · DESIGN &amp; DECOR</small>
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="header-nav hidden lg:flex items-center gap-5 font-sans uppercase text-ink"
        >
          {siteConfig.nav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isCurrent(link.href) ? "page" : undefined}
              className="hover:text-aubergine transition-colors focus-visible:outline-2 focus-visible:outline-tangerine focus-visible:outline-offset-4 rounded-sm"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="bg-aubergine px-6 py-2.5 text-cream-light hover:bg-ink-deep transition-colors focus-visible:outline-2 focus-visible:outline-tangerine focus-visible:outline-offset-4"
          >
            {siteConfig.primaryCta}
          </Link>
        </nav>

        <button
          ref={toggleRef}
          className="lg:hidden text-ink focus-visible:outline-2 focus-visible:outline-tangerine focus-visible:outline-offset-4 rounded-sm"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(!open)}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div
          id="mobile-menu"
          ref={panelRef}
          className="mobile-menu-panel lg:hidden border-t border-taupe/40 bg-cream-light"
        >
          <nav
            aria-label="Mobile"
            className="mx-auto max-w-6xl px-6 py-4 flex flex-col gap-4 font-sans text-sm uppercase tracking-wide-lg"
          >
            {siteConfig.nav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isCurrent(link.href) ? "page" : undefined}
                className="hover:text-aubergine focus-visible:outline-2 focus-visible:outline-tangerine focus-visible:outline-offset-4 rounded-sm"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="bg-aubergine px-6 py-2.5 text-cream-light text-center focus-visible:outline-2 focus-visible:outline-tangerine focus-visible:outline-offset-4"
            >
              {siteConfig.primaryCta}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
