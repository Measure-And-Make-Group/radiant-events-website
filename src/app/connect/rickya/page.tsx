import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { CardActions } from "./CardActions";
import styles from "./card.module.css";
import ArrowIcon from "@/components/ArrowIcon";

export const metadata: Metadata = {
  title: { absolute: "Rickya Fandino | Connect with Radiant Events Planning" },
  description:
    "Connect with Rickya Fandino, founder of Radiant Events Planning. Save her business contact, see her work, or start an event inquiry.",
  alternates: { canonical: "/connect/rickya" },
  openGraph: {
    title: "Rickya Fandino | Radiant Events Planning",
    description:
      "Planning with Purpose. Serving with Grace. Connect with Rickya.",
    url: "https://www.radianteventsplanning.com/connect/rickya",
    images: [{ url: "/images/rickya-fandino.webp", alt: "Rickya Fandino" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rickya Fandino | Radiant Events Planning",
    description:
      "Planning with Purpose. Serving with Grace. Connect with Rickya.",
    images: ["/images/rickya-fandino.webp"],
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
              preload
              sizes="(max-width: 700px) 240px, 338px"
              className={styles.portrait}
            />
          </div>
          <div className={styles.identity}>
            <p className={styles.eyebrow}>
              Atlanta, Georgia · Event Planning &amp; Design
            </p>
            <h1>
              Rickya <em>Fandino.</em>
            </h1>
            <p className={styles.role}>Founder, Radiant Events Planning</p>
            <p className={styles.intro}>
              I help bring celebrations to life through thoughtful planning,
              beautiful design, and personal care, so you can be fully present
              for the moments that matter most.
            </p>
            <p className={styles.signature}>
              <span>Planning with Purpose.</span>{" "}
              <span>Serving with Grace.</span>
            </p>
          </div>
        </header>
        <section aria-label="Connect with Rickya" className={styles.actions}>
          <a
            className={styles.primary}
            href="/connect/rickya/Rickya-Fandino.vcf"
            download="Rickya-Fandino.vcf"
          >
            Save my business contact <ArrowIcon direction="down" />
          </a>
          <p className={styles.phoneNumber}>
            <span>Call or text</span> 914-733-2756
          </p>
          <div className={styles.quick}>
            <a href="sms:+19147332756">
              Text me <ArrowIcon />
            </a>
            <a href="tel:+19147332756">
              Call me <ArrowIcon />
            </a>
            <a href="mailto:bookings@radianteventsplanning.com">
              Send an email <ArrowIcon />
            </a>
            <Link href="/contact">
              Start an inquiry <ArrowIcon />
            </Link>
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
            <p className={styles.eyebrow}>
              A personal approach to every occasion
            </p>
            <h2 id="radiant-card-title">Radiant Events Planning</h2>
            <p>
              Event planning, coordination, room styling, and signature
              installations throughout Atlanta and North Atlanta.
            </p>
            <nav
              className={styles.links}
              aria-label="Explore Radiant Events Planning"
            >
              <Link href="/portfolio">
                Explore our work <ArrowIcon />
              </Link>
              <Link href="/services">
                View services <ArrowIcon />
              </Link>
              <a
                href="https://www.instagram.com/radianteventsplanning"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram <ArrowIcon />
              </a>
            </nav>
          </div>
        </section>
        <section className={styles.scan} aria-labelledby="rickya-scan-title">
          <div>
            <p className={styles.eyebrow}>A connection worth keeping</p>
            <h2 id="rickya-scan-title">Let’s stay connected.</h2>
            <p>
              Scan to open my card on your phone, or save the QR code to share
              it with someone.
            </p>
            <a
              href="/connect/rickya/rickya-qr.png"
              download="Rickya-Fandino-QR.png"
            >
              Save QR code <ArrowIcon direction="down" />
            </a>
          </div>
          <Image
            src="/connect/rickya/rickya-qr.png"
            width={164}
            height={164}
            unoptimized
            alt="QR code for Rickya’s card at radianteventsplanning.com/connect/rickya"
            className={styles.qr}
          />
        </section>
        <footer className={styles.footer}>
          <span>Beautifully planned. Personally cared for.</span>
          <Link href="/">
            Visit Radiant Events Planning <ArrowIcon />
          </Link>
        </footer>
      </article>
    </div>
  );
}
