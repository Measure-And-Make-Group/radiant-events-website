import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import ArrowIcon from "@/components/ArrowIcon";
import { CardActions } from "./CardActions";
import { InAppBrowserNote } from "./InAppBrowserNote";
import { CARD_URL, CARD_TITLE, QR_IMAGE, SMS_REFERRAL_URL } from "./card-links";
import styles from "./card.module.css";

const description =
  "Connect with Rickya Fandino, founder of Radiant Events Planning and an Atlanta event consultant. Save her contact or tell her what you’re planning.";
const shareImage = "/connect/rickya/rickya-share-preview-v3.jpg";

const shareImageAlt =
  "Let’s connect with Rickya Fandino, founder of Radiant Events Planning and event consultant.";

export const metadata: Metadata = {
  title: { absolute: CARD_TITLE },
  appleWebApp: { title: "Rickya", capable: false },
  description,
  alternates: { canonical: "/connect/rickya" },
  openGraph: {
    type: "website",
    siteName: "Radiant Events Planning",
    title: CARD_TITLE,
    description,
    url: CARD_URL,
    images: [{
      url: shareImage,
      width: 1200,
      height: 630,
      type: "image/jpeg",
      alt: shareImageAlt,
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: CARD_TITLE,
    description,
    images: [{ url: shareImage, alt: shareImageAlt }],
  },
};

const consultingEmail =
  "mailto:bookings@radianteventsplanning.com?subject=Event%20consulting%20inquiry";

export default function RickyaCard() {
  return (
    <div className={styles.canvas}>
      <article className={styles.card}>
        <div className={styles.hero}>
          <div className={styles.photo}>
            <Image
              src="/images/rickya-fandino.webp"
              alt="Rickya Fandino"
              fill
              preload
              sizes="(max-width: 680px) 100vw, 360px"
              className={styles.portrait}
            />
          </div>
          <div className={styles.identity}>
            <p className={styles.eyebrow}>Atlanta, Georgia</p>
            <h1>Rickya <em>Fandino</em></h1>
            <p className={styles.role}>
              <span>Founder of Radiant Events Planning</span>{" "}
              <span>Event Consultant</span>
            </p>
            <p className={styles.intro}>
              I have an eye for what makes a room feel inviting, a knack for
              keeping an event flowing, and a calm presence when plans shift.
              I care about the little details that make guests feel welcome.
            </p>
            <a
              className={styles.primary}
              href="/connect/rickya/Rickya-Fandino.vcf"
              download="Rickya-Fandino.vcf"
            >
              Save my business contact <ArrowIcon direction="down" />
            </a>
            <CardActions />
            <InAppBrowserNote />
          </div>
        </div>

        <section className={styles.contact} aria-label="Contact Rickya">
          <div className={styles.quick}>
            <a href="tel:+19147332756">Call me <ArrowIcon /></a>
            <a href="sms:+19147332756">Text me <ArrowIcon /></a>
            <a href="mailto:bookings@radianteventsplanning.com" aria-label="Send an email">Email me <ArrowIcon /></a>
          </div>
        </section>

        <section className={styles.work} aria-labelledby="rickya-work-title">
          <h2 id="rickya-work-title">Work with Rickya</h2>
          <div className={styles.services}>
            <section className={styles.planning} aria-labelledby="rickya-radiant-title">
              <figure>
                <div className={styles.eventGallery}>
                  <div className={styles.eventPhoto}>
                    <Image
                      src="/images/rickya-throne-mens-night-room.webp"
                      alt="Candlelit tables in the event room for Throne Church Men’s Night"
                      fill
                      sizes="(max-width: 680px) 58vw, 295px"
                    />
                  </div>
                  <div className={styles.eventPhoto}>
                    <Image
                      src="/images/rickya-throne-mens-night-place-setting.webp"
                      alt="Menu tied with terracotta ribbon at a black and gold place setting"
                      fill
                      sizes="(max-width: 680px) 40vw, 195px"
                    />
                  </div>
                </div>
                <figcaption className={styles.eventCredit}>
                  <a href="https://www.instagram.com/p/DfngTrRkQwg/" target="_blank" rel="noopener noreferrer">
                    Throne Church Men’s Night <ArrowIcon />
                  </a>
                </figcaption>
              </figure>
              <div className={styles.serviceContent}>
                <p className={styles.eyebrow}>Planning &amp; design</p>
                <h3 id="rickya-radiant-title">Radiant Events Planning</h3>
                <p>
                  Event planning, day-of coordination, styling, and signature
                  installations in Atlanta and North Atlanta.
                </p>
                <Link className={styles.serviceButton} href="/contact">
                  Start an event inquiry <ArrowIcon />
                </Link>
                <nav className={styles.links} aria-label="Explore Radiant Events Planning">
                  <Link href="/portfolio">See our work <ArrowIcon /></Link>
                  <Link href="/services">View services <ArrowIcon /></Link>
                </nav>
              </div>
            </section>
            <section className={styles.consulting} aria-labelledby="rickya-consulting-title">
              <div className={styles.serviceContent}>
                <p className={styles.eyebrow}>For hosts &amp; teams</p>
                <h3 id="rickya-consulting-title">Event consulting</h3>
                <p>
                  Planning your own event? I can help you clarify the vision,
                  set priorities, and think through your timeline, vendor
                  decisions, and guest experience.
                </p>
                <p>Tell me what you’re planning and where you’d like a second set of eyes.</p>
                <a className={styles.serviceButton} href={consultingEmail}>
                  Ask about consulting <ArrowIcon />
                </a>
              </div>
            </section>
          </div>
        </section>

        <section className={styles.scan} aria-labelledby="rickya-scan-title">
          <div>
            <h2 id="rickya-scan-title">Pass my card along</h2>
            <p>Scan to open on another phone, or share it with a friend.</p>
            <div className={styles.links}>
              <a href={SMS_REFERRAL_URL}>Text my card to a friend <ArrowIcon /></a>
              <a href={QR_IMAGE} download="Rickya-Fandino-QR.png">
                Save QR code <ArrowIcon direction="down" />
              </a>
            </div>
          </div>
          <Image
            src={QR_IMAGE}
            width={144}
            height={144}
            unoptimized
            alt="QR code for Rickya’s digital business card"
            className={styles.qr}
          />
        </section>

        <footer className={styles.footer}>
          <Link href="/">Visit Radiant Events Planning <ArrowIcon /></Link>
          <a href="https://www.instagram.com/radianteventsplanning" target="_blank" rel="noopener noreferrer">
            Instagram <ArrowIcon />
          </a>
        </footer>
      </article>
    </div>
  );
}
