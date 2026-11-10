import Link from "next/link";
import ArrowIcon from "@/components/ArrowIcon";
import PageHero from "@/components/sections/PageHero";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata = pageMetadata(
  "Our Process",
  "How working with Radiant Events Planning flows, from your first inquiry to a beautifully finished space in Atlanta and North Atlanta.",
  "/process",
);

// Step copy is the owner's approved wording (owner revision brief, 2026-09-28).
const STEPS = [
  {
    title: "Inquiry",
    copy: "Start by telling us about your celebration — the vision, date, location, budget, inspiration, and the details that matter most to you.",
  },
  {
    title: "Consultation",
    copy: "We talk through your priorities, the setting, the look you love, and what a successful event feels like to you.",
  },
  {
    title: "Concept & Scope",
    copy: "We recommend the design elements that fit your event and share a tailored scope, investment, and next steps.",
  },
  {
    title: "Design & Preparation",
    copy: "Once the direction is approved, we refine the details, source agreed materials, and confirm the installation plan.",
  },
  {
    title: "Installation",
    copy: "We coordinate the agreed access and setup details, then bring the approved design to life at your venue.",
  },
  {
    title: "Celebrate",
    copy: "Enjoy the space and the people you gathered. If takedown is included in your agreement, we'll return at the scheduled time.",
  },
];

export default function ProcessPage() {
  return (
    <div>
      <PageHero
        eyebrow="Our process"
        title={<>A clear path, <em>beautifully finished.</em></>}
        subtitle="A clear path from your first idea to a beautifully finished space."
        image={{
          src: "/images/flower-wall-install.webp",
          alt: "A stylist on a riser attaching a rose garland to a pink sequin wall during installation",
          caption: "Installation in progress",
          position: "50% 60%",
        }}
      />

      <section className="rs-section">
        <div className="rs-head" data-reveal="">
          <p className="eyebrow">Six steps</p>
          <h2>
            Simple to begin. <em>Cared for throughout.</em>
          </h2>
          <p>
            Every event is scoped individually, so the details of each step
            are confirmed in your proposal.
          </p>
        </div>
        <ol className="rs-steps">
          {STEPS.map((step, i) => (
            <li className="rs-step" key={step.title} data-reveal="">
              <span className="rs-step-number">{String(i + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="closing-cta">
        <p className="eyebrow">Step one is simple</p>
        <h2>
          Tell us what you’re <em>celebrating.</em>
        </h2>
        <p>
          Share your date, location and inspiration. An inquiry starts the
          conversation and never commits you to a booking.
        </p>
        <Link href="/contact" className="button-light">
          {siteConfig.primaryCta} <ArrowIcon />
        </Link>
      </section>
    </div>
  );
}
