import Link from "next/link";
import ArrowIcon from "@/components/ArrowIcon";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import "../radiant-editorial.css";

export const metadata = pageMetadata(
  "Event Planning in Atlanta, Alpharetta, Milton & North Atlanta",
  "Explore Radiant Events Planning’s Atlanta-area service coverage for celebrations, event design, coordination and balloon installations in Alpharetta, Milton, Roswell and nearby communities.",
  "/service-areas",
);

export default function ServiceAreasPage() {
  return (
    <div className="re-home re-services-page">
      <section className="re-subpage-hero">
        <p className="re-kicker">ROOTED IN ATLANTA · AVAILABLE ACROSS NORTH ATLANTA</p>
        <h1>Beautiful moments, <em>close to home.</em></h1>
        <p>From intimate celebrations to meaningful gatherings, Radiant Events Planning helps clients explore event design, planning and signature installations throughout Atlanta and nearby communities.</p>
        <Link href="/contact" className="re-cta re-cta-olive">Ask about your event location <ArrowIcon /></Link>
      </section>
      <section className="re-service-areas" data-reveal aria-labelledby="areas-title">
        <p className="re-kicker">LOCAL SERVICE INQUIRIES</p>
        <h2 id="areas-title">Atlanta and <em>the surrounding communities.</em></h2>
        <p>We welcome inquiries for events in the following locations. Actual service availability depends on your date, venue, setup requirements and agreed scope. Locations are not office addresses.</p>
        <div className="re-area-grid">
          {siteConfig.serviceAreas.map((name) => (
            <div key={name} className="re-area-city">{name}, GA</div>
          ))}
        </div>
      </section>
      <section className="re-services-note" data-reveal>
        <p className="re-kicker">WHAT WE CAN DO FOR YOUR EVENT</p>
        <h2>Thoughtful planning. <em>Beautiful details.</em></h2>
        <p>Whether you’re planning a shower in Alpharetta, exploring a celebration in Milton, or styling an event in Atlanta, you can inquire about planning and coordination, room styling, and signature balloons or backdrops.</p>
        <div className="re-services-note-links">
          <Link href="/services" className="re-text-link">Explore our services <ArrowIcon /></Link>
          <Link href="/contact" className="re-cta re-cta-olive">Tell us your city and event date <ArrowIcon /></Link>
        </div>
      </section>
    </div>
  );
}
