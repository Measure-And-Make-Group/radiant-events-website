import ArrowIcon from "@/components/ArrowIcon";
import Link from "next/link";
import Image from "next/image";
import { pageMetadata } from "@/lib/seo";
import PageHero from "@/components/sections/PageHero";
export const metadata = pageMetadata(
  "The Heart Behind REP",
  "Meet Rickya Fandino and the thoughtful, gracious approach behind Radiant Events in Atlanta.",
  "/about",
);
export default function About() {
  return (
    <div>
      <PageHero
        eyebrow="The heart behind REP"
        title="Purpose in the process. Grace in the details."
        subtitle="We believe the way you're cared for matters as much as the way your celebration looks."
      />
      <section className="section-wrap story-split">
        <div className="story-image">
          <Image
            src="/images/rickya-fandino.webp"
            alt="Rickya Fandino, founder of Radiant Events Planning"
            fill
            sizes="(max-width:760px) 100vw, 50vw"
          />
        </div>
        <div>
          <p className="eyebrow">Meet the founder · Rickya Fandino</p>
          <h2>
            Beautifully considered.
            <br />
            <em>Personally cared for.</em>
          </h2>
          <p>
            Rickya Fandino loves what celebrations make possible: people coming
            together, stories being honored, and memories that stay long after
            the room is cleared. Radiant Events Planning (REP) is her way of bringing that love for
            people into thoughtful planning, beautiful design, and gracious
            care.
          </p>
          <p>
            Her experience planning multisite events and conferences at Victory
            Church brings a foundation of careful coordination, clear
            communication, and excellence to the details. She carries that same
            intentional care into your milestone, gathering, or celebration.
          </p>
          <p>
            Maybe you can already picture the room. Maybe all you know is how
            you want your guests to feel. Rickya starts by listening, then helps
            connect your vision with a clear plan. The goal is to ease the
            stress of bringing it together so you can be present, feel cared
            for, and enjoy the people you brought into the room.
          </p>
          <Link href="/contact" className="text-link">
            Let&apos;s get to know your vision <ArrowIcon />
          </Link>
        </div>
      </section>
      <section className="bg-cream">
        <div className="section-wrap">
          <p className="eyebrow">What guides us</p>
          <div className="values-grid">
            <div>
              <h3>Intentional beauty.</h3>
              <p>
                Colors, textures, and focal moments chosen to belong together
                and tell your story.
              </p>
            </div>
            <div>
              <h3>Gracious service.</h3>
              <p>
                Warm communication, thoughtful guidance, and care for the person
                behind the occasion.
              </p>
            </div>
            <div>
              <h3>Meaningful moments.</h3>
              <p>
                Space for joy, connection, and the people who make your
                celebration matter.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="closing-cta">
        <p className="eyebrow">Our foundation · Psalm 52:8</p>
        <h2>
          Rooted in faith.
          <br />
          <em>Growing in grace.</em>
        </h2>
        <p>
          Our olive branch is a reminder of the faith and purpose at the heart
          of REP.
        </p>
        <Link href="/contact" className="button-light">
          Start your event inquiry <ArrowIcon />
        </Link>
      </section>
    </div>
  );
}
