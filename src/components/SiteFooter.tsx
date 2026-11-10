"use client";
import ArrowIcon from "@/components/ArrowIcon";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export default function SiteFooter() {
  return (
    <footer className="bg-ink text-cream-light">
      <div className="mx-auto max-w-6xl px-6 py-16 grid gap-12 md:grid-cols-3">
        <div>
          <Image
            src="/brand/radiant-olive-logo.webp"
            alt={`${siteConfig.name} logo`}
            width={220}
            height={140}
            className="footer-logo mb-8"
          />
          <p className="font-display italic text-lg text-blush">
            {siteConfig.tagline}
          </p>
        </div>

        <div className="font-sans text-sm">
          <h3 className="uppercase tracking-wide-lg text-blush mb-4">
            Explore
          </h3>
          <ul className="space-y-2 text-cream/90">
            {siteConfig.nav.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
            {[{href:"/service-areas",label:"Service areas"},{href:"/investment",label:"Investment"},{href:"/faq",label:"Questions"},{href:"/client-guide",label:"Client guide"},{href:"/journal",label:"Helpful Reads"}].map(link => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}
            <li>
              <Link href="/contact" className="hover:text-white">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div className="font-sans text-sm">
          <h3 className="uppercase tracking-wide-lg text-blush mb-4">
            Get In Touch
          </h3>
          <ul className="space-y-2 text-cream/90">
            <li>{siteConfig.location}</li>
            <li>
              <Link
                href="/contact"
                className="underline decoration-tangerine underline-offset-4 hover:text-white"
              >
                {siteConfig.primaryCta}
              </Link>
            </li>
            <li>
              <a
                href={siteConfig.social.instagram!}
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram <ArrowIcon />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="footer-bottom mx-auto max-w-6xl px-6 py-6 text-xs text-cream/60 font-sans flex flex-col sm:flex-row justify-between gap-2">
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>
              &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
            </span>
            <button type="button" onClick={() => window.dispatchEvent(new Event("rep:cookie-settings"))} className="inline-flex min-h-11 items-center hover:text-white underline underline-offset-2">Cookie preferences</button>
            {siteConfig.footerLegal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex min-h-11 items-center hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </span>
          <span>Rooted in grace · Psalm 52:8</span>
          <Link href="/payments" className="footer-payment">Make a payment / Pay deposit <ArrowIcon /></Link>
        </div>
      </div>
    </footer>
  );
}
