import Link from "next/link";
import PageHero from "@/components/sections/PageHero";
import ArrowIcon from "@/components/ArrowIcon";
import Breadcrumbs from "@/components/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Your Radiant Client Guide",
  "A practical guide to inquiry, proposal review, venue preparation, event day, and payments for your Radiant celebration.",
  "/client-guide",
);
const steps = [
  {
    title: "Before you inquire",
    copy: "Gather your likely date, venue or location, approximate guest count, comfortable budget, and a few inspiration images. Tell us how you want the occasion to feel and what you need help with.",
  },
  {
    title: "When you review your proposal",
    copy: "Check the design direction, deliverables, responsibilities, setup and collection arrangements, payment schedule, and booking terms. Ask about anything that is unclear before accepting.",
  },
  {
    title: "Before the event",
    copy: "Confirm venue measurements, access times, parking or loading arrangements, installation restrictions, and a venue contact. Share changes early so the agreed plan can be reviewed.",
  },
  {
    title: "On the day",
    copy: "Follow the confirmed timeline and access arrangements. Let the agreed point of contact handle venue questions so you can focus on your guests and the occasion.",
  },
  {
    title: "After the celebration",
    copy: "Follow the agreed collection and return instructions for any installed or hired items. We would love to hear what felt meaningful and, with your permission, see photographs from your day.",
  },
];
export default function Guide() {
  return (
    <>
      <PageHero
        eyebrow="Care at every step"
        title="A little preparation. A lighter experience."
        subtitle="A place to return to as your celebration comes together."
      />
      <section className="section-wrap">
        <Breadcrumbs
          items={[{ label: "Client guide", href: "/client-guide" }]}
        />
        <div className="guide-steps">
          {steps.map((s, i) => (
            <article key={s.title}>
              <span className="eyebrow">0{i + 1}</span>
              <div>
                <h2>{s.title}</h2>
                <p>{s.copy}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="client-actions">
          <Link className="button-primary" href="/payments">
            Make a payment or deposit <ArrowIcon />
          </Link>
          <Link className="text-link" href="/contact">
            Ask about your booking <ArrowIcon />
          </Link>
          <Link className="text-link" href="/faq">
            Common questions <ArrowIcon />
          </Link>
        </div>
      </section>
    </>
  );
}
