import Link from "next/link";
import PageHero from "@/components/sections/PageHero";
import ArrowIcon from "@/components/ArrowIcon";
import Breadcrumbs from "@/components/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Your Event Investment & Custom Proposal",
  "Understand what shapes a Radiant Events proposal, choose the right level of support, and plan your event design budget in Atlanta.",
  "/investment",
);
export default function Investment() {
  return (
    <>
      <PageHero
        eyebrow="An intentional investment"
        title="The right scope. Beautifully considered."
        subtitle="A custom proposal should make the possibilities clearer—and help you decide with confidence."
      />
      <section className="section-wrap">
        <Breadcrumbs items={[{ label: "Investment", href: "/investment" }]} />
        <div className="service-choice">
          <div>
            <h2>
              Start with what
              <br />
              <em>matters most.</em>
            </h2>
            <p>
              There is no single package price for every celebration. Your
              comfortable budget helps us understand the scale and priorities of
              your event.
            </p>
          </div>
          <div>
            <p>
              We discuss your design, venue, materials, installation needs, and
              the planning responsibilities you want help with. Your proposal
              brings those decisions into a clear scope before you book.
            </p>
            <p>
              Tell us which moment matters most: the welcome, the photographs,
              the room as a whole, or the ease of having the details
              coordinated.
            </p>
          </div>
        </div>
        <div className="support-grid">
          {[
            [
              "One beautiful focal moment",
              "Signature Installations",
              "Balloons, a backdrop, or a considered photo moment.",
              "signature-installations",
            ],
            [
              "A cohesive room",
              "Design & Room Styling",
              "A connected palette, layout, and styling direction.",
              "design-room-styling",
            ],
            [
              "Support behind the scenes",
              "Planning & Coordination",
              "Help bringing the agreed logistics and event flow together.",
              "planning-coordination",
            ],
          ].map(([eyebrow, title, copy, slug]) => (
            <Link href={`/services/${slug}`} key={slug}>
              <p className="eyebrow">{eyebrow}</p>
              <h3>{title}</h3>
              <p>{copy}</p>
              <span className="text-link">
                Explore the scope <ArrowIcon />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="bg-cream">
        <div className="section-wrap service-choice">
          <div>
            <p className="eyebrow">What shapes your proposal</p>
            <h2>
              Beauty lives
              <br />
              <em>in the details.</em>
            </h2>
          </div>
          <ul className="care-list">
            <li>Size, materials, and complexity of the design</li>
            <li>Venue location, measurements, restrictions, and access</li>
            <li>Setup, delivery, collection, and staffing needs</li>
            <li>Rentals or specialist vendors included in the agreed scope</li>
            <li>Planning responsibilities and the event-day timeline</li>
          </ul>
        </div>
      </section>
      <section className="section-wrap service-choice">
        <div>
          <h2>
            Know what you’re
            <br />
            <em>saying yes to.</em>
          </h2>
        </div>
        <div>
          <p>
            Before booking, review the deliverables, responsibilities, venue
            requirements, payment schedule, and change or cancellation terms in
            your proposal or agreement.
          </p>
          <p>
            A date is not independently reserved by an inquiry or payment.
            Follow your confirmed booking instructions, and contact us if any
            detail is unclear.
          </p>
          <Link href="/client-guide" className="text-link">
            Your client guide <ArrowIcon />
          </Link>
        </div>
      </section>
      <section className="closing-cta">
        <h2>
          Tell us your priorities.
          <br />
          <em>We’ll shape the possibilities.</em>
        </h2>
        <Link className="button-light" href="/contact">
          Start your event inquiry <ArrowIcon />
        </Link>
      </section>
    </>
  );
}
