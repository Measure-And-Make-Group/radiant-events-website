import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import ArrowIcon from "@/components/ArrowIcon";
import { siteConfig } from "@/lib/site-config";
import { portfolioProjects } from "@/content/portfolio";
import "./radiant-editorial.css";

export const metadata: Metadata = {
  title: { absolute: "Radiant Events Planning | Event Planning & Design in Atlanta, Alpharetta & Milton" },
  description: siteConfig.oneLiner,
  alternates: { canonical: "/" },
};

const specialties = [
  {
    number: "01",
    name: "Planning & coordination",
    text: "For help with the moving pieces: timelines, vendors, logistics, and a calm presence on the day, matched to your event and confirmed in your proposal.",
    best: "Hosts who want one trusted partner holding every thread.",
    href: "/services/planning-coordination",
    image: "/images/candlelight-hall.webp",
    alt: "Rows of candlelit banquet tables set for an evening event in Roswell",
  },
  {
    number: "02",
    name: "Design & room styling",
    text: "For a cohesive setting: palette direction, tablescapes, and decorative details carried through the whole room.",
    best: "A venue and a vision that need one considered look.",
    href: "/services/design-room-styling",
    image: "/images/candlelight-detail.webp",
    alt: "Navy plates on gold chargers with ribbon-tied napkins, greenery and candlelight",
  },
  {
    number: "03",
    name: "Signature installations",
    text: "For a photo-ready focal point: custom balloon installations and backdrops, booked on their own or alongside other services.",
    best: "One exceptional moment when the rest is already planned.",
    href: "/services/signature-installations",
    image: "/images/game-night.webp",
    alt: "A balloon column in purple, pink, black and silver with oversized dice at a game night entrance",
  },
];

// Curated, not exhaustive: only the strongest approved projects are featured.
const featuredWork = portfolioProjects.slice(0, 2);

export default function Home() {
  return (
    <div className="re-home">
      <section className="re-opening" aria-labelledby="re-title">
        <div className="re-opening-ambience" aria-hidden="true">
          <span className="re-ambience-ring re-ambience-ring-one" />
          <span className="re-ambience-ring re-ambience-ring-two" />
        </div>
        <div className="re-opening-inner">
          <p className="re-kicker">RADIANT EVENTS PLANNING · ATLANTA, GEORGIA</p>
          <h1 id="re-title">
            <span className="rm-line"><span>Planning</span></span>
            <span className="rm-line"><span>with purpose.</span></span>
            <em className="rm-line"><span>Serving with grace.</span></em>
          </h1>
          <p className="re-opening-intro">
            Event planning, room styling, and signature installations across
            Atlanta and North Atlanta, so you can be fully present with the
            people who matter most.
          </p>
          <div className="re-opening-actions">
            <Link className="re-cta re-cta-olive" href="/contact">Start your event inquiry <ArrowIcon /></Link>
            <Link className="re-text-link" href="#re-work">Explore our work <ArrowIcon /></Link>
          </div>
        </div>
        <div className="re-opening-media">
          <figure className="re-hero-main">
            <Image
              src="/images/candlelight-tables.webp"
              alt="Long banquet tables dressed in black linen with gold chargers, greenery runners and rows of candlelight"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 46vw"
            />
          </figure>
          {/* Desktop and tablet only: on phones one photograph tells the story. */}
          <figure className="re-hero-inset" aria-hidden="true">
            <Image
              src="/images/candlelight-detail.webp"
              alt=""
              fill
              sizes="(max-width: 900px) 34vw, 15vw"
            />
          </figure>
          <p className="re-hero-caption">Real Radiant work · Candlelit tables, Roswell</p>
        </div>
        <div className="re-opening-bottom">
          <span>ATLANTA · ALPHARETTA · MILTON · NORTH ATLANTA</span>
          <a href="#re-intro" aria-label="Scroll to discover Radiant">SCROLL TO DISCOVER ↓</a>
        </div>
      </section>

      <section className="re-statement" data-reveal id="re-intro" aria-labelledby="re-statement-title">
        <div className="re-statement-number">01 / THE RADIANT APPROACH</div>
        <div>
          <p className="re-kicker">A celebration should feel like you.</p>
          <h2 id="re-statement-title">Beautifully planned. <em>Personally cared for.</em></h2>
          <p>
            The best gatherings are felt long after the last guest leaves.
            We combine personal attention, considered styling, and purposeful
            planning to make room for the moments that matter.
          </p>
          <Link href="/about" className="re-text-link">Discover the heart behind Radiant <ArrowIcon /></Link>
        </div>
      </section>

      <section className="re-services" data-reveal aria-labelledby="re-services-title">
        <div className="re-section-heading">
          <p className="re-kicker">WHAT WE CREATE</p>
          <h2 id="re-services-title">Your occasion. <em>Beautifully considered.</em></h2>
          <p>Whether you need a single focal installation, cohesive styling, or help coordinating the details, we can help you find the right fit.</p>
        </div>
        <div className="re-service-grid">
          {specialties.map((item) => (
            <Link className="re-service" data-reveal href={item.href} key={item.number}>
              <div className="re-service-photo" data-reveal="mask">
                <Image src={item.image} alt={item.alt} fill sizes="(max-width: 760px) 95vw, 31vw" />
              </div>
              <div className="re-service-meta"><span>{item.number} / SERVICE</span><ArrowIcon /></div>
              <h3>{item.name}</h3>
              <p>{item.text}</p>
              <span className="re-service-best"><b>Best for</b>{item.best}</span>
            </Link>
          ))}
        </div>
        <Link href="/services" className="re-text-link re-services-link">Explore all services <ArrowIcon /></Link>
      </section>

      <section className="re-client-guide" id="find-your-fit" aria-labelledby="re-guide-title" data-reveal>
        <div className="re-client-guide-intro">
          <p className="re-kicker">FIND YOUR CELEBRATION</p>
          <h2 id="re-guide-title">What are you <em>celebrating?</em></h2>
          <p>Discover how we approach the moments that bring people together. Not sure which service fits? Start with your occasion.</p>
        </div>
        <div className="re-client-guide-links">
          {[
            ["01", "Milestones & private celebrations", "Birthdays, anniversaries, and moments worth marking.", "/occasions/milestone-celebrations"],
            ["02", "Showers & intimate gatherings", "Warm, personal celebrations for life’s new chapters.", "/occasions/showers-intimate-gatherings"],
            ["03", "Brand & community gatherings", "Thoughtful environments for shared purpose and connection.", "/occasions/brand-community-gatherings"],
          ].map(([number, title, copy, href]) => (
            <Link className="re-guide-link" href={href} key={href} data-reveal>
              <span className="re-guide-number">{number}</span>
              <span className="re-guide-text"><strong>{title}</strong><small>{copy}</small></span>
              <ArrowIcon />
            </Link>
          ))}
        </div>
      </section>
      <section className="re-pause" data-reveal aria-label="Our design philosophy">
        <p>BEAUTY WITHOUT THE BURDEN</p>
        <h2>Be present for <em>the beautiful part.</em></h2>
        <span>WE&apos;LL HELP BRING THE DETAILS TOGETHER.</span>
      </section>

      <section className="re-collection" data-reveal id="re-work" aria-labelledby="re-work-title">
        <div className="re-collection-head">
          <div>
            <p className="re-kicker">A LOOK INSIDE OUR WORK</p>
            <h2 id="re-work-title">A collection of <em>meaningful moments.</em></h2>
          </div>
          <Link href="/portfolio" className="re-text-link">View the collection <ArrowIcon /></Link>
        </div>
        <div className="re-work-grid">
          {featuredWork.map((project, i) => (
            <Link href={`/portfolio/${project.slug}`} className={`re-work-card re-work-card-${i + 1}`} data-reveal key={project.slug}>
              <div className="re-work-photo" data-reveal="mask">
                <Image src={project.image} alt={project.alt} fill sizes="(max-width: 760px) 94vw, 45vw" />
              </div>
              <div className="re-work-info">
                <span>{project.category}</span>
                <h3>{project.title}</h3>
                <ArrowIcon />
              </div>
            </Link>
          ))}
          <div className="re-work-note" data-reveal>
            <p className="re-kicker">REAL RADIANT WORK</p>
            <p>
              Every photograph here is from an event we styled. Client names
              and private details are removed out of respect for the people we
              celebrate.
            </p>
            <Link href="/contact" className="re-text-link">Plan your occasion <ArrowIcon /></Link>
          </div>
        </div>
      </section>

      <section className="re-founder" data-reveal aria-labelledby="re-founder-title">
        <div className="re-founder-image" data-reveal="mask">
          <Image src="/images/rickya-fandino.webp" alt="Rickya Fandino, founder of Radiant Events Planning" fill sizes="(max-width: 760px) 100vw, 45vw" />
        </div>
        <div className="re-founder-content">
          <p className="re-kicker re-kicker-light">A NOTE FROM THE FOUNDER</p>
          <h2 id="re-founder-title">The details matter. <em>But the people matter more.</em></h2>
          <p>
            I&apos;m Rickya. I believe celebrations deserve both beauty and intention.
            My heart is to help you create a gathering that feels personal,
            cared for, and full of the moments you hoped for.
          </p>
          <Link className="re-text-link re-text-light" href="/about">Get to know Rickya <ArrowIcon /></Link>
        </div>
      </section>

      <section className="re-journey" data-reveal aria-labelledby="re-journey-title">
        <div className="re-section-heading">
          <p className="re-kicker">SIMPLE, PERSONAL, THOUGHTFUL</p>
          <h2 id="re-journey-title">A beautiful experience <em>from the beginning.</em></h2>
        </div>
        <div className="re-steps">
          {[
            ["01", "Tell us your vision", "Share the occasion, the location, your inspiration, and the feeling you hope to create."],
            ["02", "Let’s shape the details", "We’ll discuss the right design and support, with a proposal tailored to the agreed scope."],
            ["03", "Enjoy your moment", "Once booked, we bring the agreed details together so you can focus on your guests."],
          ].map(([number, title, text]) => (
            <div className="re-step" data-reveal key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="re-client-faq" aria-labelledby="re-faq-title" data-reveal>
        <div className="re-faq-intro">
          <p className="re-kicker">BEFORE WE BEGIN</p>
          <h2 id="re-faq-title">A few helpful <em>answers.</em></h2>
          <p>We want you to feel confident and informed from the first conversation.</p>
          <Link href="/faq" className="re-text-link">Read all questions <ArrowIcon /></Link>
        </div>
        <div className="re-faq-items">
          <details><summary>Can I book only a backdrop or balloon installation?<span aria-hidden="true">+</span></summary><p>Yes. Signature installations can be booked on their own. Tell us the occasion, location, and what you envision.</p></details>
          <details><summary>What if I don’t have a full vision yet?<span aria-hidden="true">+</span></summary><p>That’s fine. Share your date, occasion, venue, and inspiration. We’ll help shape the appropriate design and support.</p></details>
          <details><summary>How does pricing work?<span aria-hidden="true">+</span></summary><p>Each proposal is custom to the agreed scope, materials, location, and setup needs. An inquiry doesn’t reserve your date.</p></details>
          <details><summary>What happens after I inquire?<span aria-hidden="true">+</span></summary><p>Rickya usually reaches out within a few minutes by phone or text to talk through your priorities, availability, and next steps.</p></details>
        </div>
      </section>
      <section className="re-finale" data-reveal aria-labelledby="re-finale-title">
        <p className="re-kicker re-kicker-light">LET’S MAKE SOMETHING MEANINGFUL</p>
        <h2 id="re-finale-title">You bring the occasion. <em>We’ll bring the radiance.</em></h2>
        <p>Share your date, location, inspiration, and comfortable budget. Rickya usually reaches out within a few minutes by phone or text.</p>
        <Link href="/contact" className="re-cta re-cta-light">Begin your event inquiry <ArrowIcon /></Link>
      </section>
    </div>
  );
}
