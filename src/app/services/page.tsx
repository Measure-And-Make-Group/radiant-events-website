import Image from "next/image";
import Link from "next/link";
import ArrowIcon from "@/components/ArrowIcon";
import { pageMetadata } from "@/lib/seo";
import { services } from "@/content/services";
import "../radiant-editorial.css";

export const metadata = pageMetadata(
  "Event Planning, Design & Balloon Installations | Atlanta, Alpharetta & Milton",
  "Explore event planning and coordination, room styling, custom balloon installations and backdrops across Atlanta, Alpharetta, Milton, Roswell and nearby communities.",
  "/services",
);

const images = [
  {src:"/images/celebration-detail.webp", alt:"Thoughtfully coordinated celebration details"},
  {src:"/images/styled-table-detail.webp", alt:"Event table with carefully styled decorative details"},
  {src:"/images/pink-arch.webp", alt:"Pink balloon installation and circular gold event backdrop"},
];

export default function ServicesPage() {
  return (
    <div className="re-home re-services-page">
      <section className="re-subpage-hero" aria-labelledby="services-heading">
        <p className="re-kicker">RADIANT EVENTS PLANNING / HOW WE HELP</p>
        <h1 id="services-heading">Your vision, <em>beautifully brought together.</em></h1>
        <p>From the first idea to the finishing touch, we offer three thoughtful ways to support your event. Choose one service or discuss combining them in a tailored proposal.</p>
        <Link href="/contact" className="re-cta re-cta-olive">Start your event inquiry <ArrowIcon /></Link>
        <span className="re-subpage-index" aria-hidden="true">01 — 03 / SERVICES</span>
      </section>
      <section className="re-service-catalog" aria-label="Event planning and design services">
        {services.map((service, i) => (
          <article className="re-service-feature" key={service.slug}>
            <div className="re-service-feature-photo" data-reveal>
              <Image src={images[i].src} alt={images[i].alt} fill sizes="(max-width:760px) 100vw, 48vw" />
              <span>0{i + 1} / 03</span>
            </div>
            <div className="re-service-feature-content" data-reveal>
              <p className="re-kicker">{service.tagline}</p>
              <h2>{service.title}</h2>
              <p className="re-service-feature-summary">{service.summary}</p>
              <p className="re-service-ideal"><strong>Best for</strong> {service.idealFor}</p>
              <h3>What we can help with</h3>
              <ul>{service.includes.slice(0,4).map(item=><li key={item}>{item}</li>)}</ul>
              <Link href={`/services/${service.slug}`} className="re-text-link">Explore this service <ArrowIcon /></Link>
            </div>
          </article>
        ))}
      </section>
      <section className="re-services-note" data-reveal>
        <p className="re-kicker">PLANNING WITH PURPOSE. SERVING WITH GRACE.</p>
        <h2>Not sure which level <em>of support fits?</em></h2>
        <p>Tell us the occasion, venue, date, priorities, and comfortable investment range. We’ll help clarify which services make sense before developing your proposal.</p>
        <div className="re-services-note-links">
          <Link className="re-cta re-cta-olive" href="/contact">Tell us about your event <ArrowIcon /></Link>
          <Link className="re-text-link" href="/investment">Learn about investment <ArrowIcon /></Link>
        </div>
      </section>
      <section className="re-service-areas" data-reveal aria-labelledby="service-areas-title">
        <p className="re-kicker">GREATER ATLANTA AND NORTH ATLANTA</p>
        <h2 id="service-areas-title">Locally rooted. <em>Thoughtfully present.</em></h2>
        <p>Radiant Events Planning works with clients throughout the Atlanta area, including Alpharetta, Milton, Roswell, Johns Creek, Sandy Springs, Dunwoody, Brookhaven, Marietta, Cumming, and Norcross. Travel, venue access, and availability are confirmed for every inquiry.</p>
        <Link href="/contact" className="re-text-link">Ask about your location <ArrowIcon /></Link>
      </section>
    </div>
  );
}
