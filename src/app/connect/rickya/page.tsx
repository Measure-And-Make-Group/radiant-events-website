import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { CardActions } from "./CardActions";
import styles from "./card.module.css";

export const metadata: Metadata = {
  title: "Rickya Fandino | Connect with Radiant Events Planning",
  description: "Connect with Rickya Fandino, founder of Radiant Events Planning. Save her business contact, see her work, or start an event inquiry.",
  alternates: { canonical: "/connect/rickya" },
  openGraph: {
    title: "Rickya Fandino | Radiant Events Planning",
    description: "Planning with Purpose. Serving with Grace. Connect with Rickya.",
    url: "https://www.radianteventsplanning.com/connect/rickya",
    images: [{ url: "/images/rickya-fandino.webp", alt: "Rickya Fandino" }],
  },
};

export default function RickyaCard() {
  return (
    <div className={styles.canvas}>
      <article className={styles.card}>
        <div className={styles.top}>
          <span>A thoughtful connection begins here.</span>
          <CardActions />
        </div>
        <header className={styles.hero}>
          <div className={styles.photo}>
            <Image
              src="/images/rickya-fandino.webp"
              alt="Rickya Fandino, founder of Radiant Events Planning"
              fill
              priority
              sizes="(max-width: 700px) 65vw, 350px"
              className={styles.portrait}
            />
          </div>
          <div className={styles.identity}>
            <p className={styles.eyebrow}>Atlanta, Georgia · Event Planning &amp; Design</p>
            <h1>Rickya <em>Fandino.</em></h1>
            <p className={styles.role}>Founder, Radiant Events Planning</p>
            <p className={styles.intro}>
              I help bring celebrations to life through thoughtful planning,
              beautiful design, and personal care, so you can be fully present
              for the moments that matter most.
            </p>
            <p className={styles.signature}>Planning with Purpose. Serving with Grace.</p>
          </div>
        </header>
        <section aria-label="Connect with Rickya" className={styles.actions}>
          <a className={styles.primary} href="/connect/rickya/Rickya-Fandino.vcf" download="Rickya-Fandino.vcf">
            Save my business contact <span aria-hidden="true">↓</span>
          </a>
          <div className={styles.quick}>
            <a href="mailto:bookings@radianteventsplanning.com">Send an email <span aria-hidden="true">↗</span></a>
            <Link href="/contact">Start an inquiry <span aria-hidden="true">↗</span></Link>
          </div>
        </section>
        <section className={styles.brand} aria-labelledby="radiant-card-title">
          <Image
            src="/brand/radiant-olive-logo.webp"
            width={76}
            height={76}
            alt="Radiant Events Planning olive branch logo"
            className={styles.logo}
          />
          <div className={styles.brandText}>
            <p className={styles.eyebrow}>A personal approach to every occasion</p>
            <h2 id="radiant-card-title">Radiant Events Planning</h2>
            <p>Event planning, coordination, room styling, and signature installations throughout Atlanta and North Atlanta.</p>
            <nav className={styles.links} aria-label="Explore Radiant Events Planning">
              <Link href="/portfolio">Explore our work <span aria-hidden="true">↗</span></Link>
              <Link href="/services">View services <span aria-hidden="true">↗</span></Link>
              <a href="https://www.instagram.com/radianteventsplanning" target="_blank" rel="noopener noreferrer">Instagram <span aria-hidden="true">↗</span></a>
            </nav>
          </div>
        </section>
        <footer className={styles.footer}>
          <span>Beautifully planned. Personally cared for.</span>
          <Link href="/">Visit Radiant Events Planning ↗</Link>
        </footer>
      </article>
    </div>
  );
}
