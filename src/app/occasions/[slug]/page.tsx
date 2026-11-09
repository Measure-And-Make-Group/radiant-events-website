import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/sections/PageHero";
import ArrowIcon from "@/components/ArrowIcon";
import Breadcrumbs from "@/components/Breadcrumbs";
import StructuredData from "@/components/StructuredData";
import { occasions } from "@/content/occasions";
import { pageMetadata, absoluteUrl } from "@/lib/seo";
export function generateStaticParams() {
  return occasions.map((o) => ({ slug: o.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const o = occasions.find((o) => o.slug === slug);
  return o
    ? pageMetadata(
        o.title + " in Atlanta",
        o.summary,
        "/occasions/" + slug,
      )
    : {};
}
export default async function Occasion({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const o = occasions.find((o) => o.slug === slug);
  if (!o) notFound();
  return (
    <>
      <PageHero eyebrow={o.eyebrow} title={o.title} subtitle={o.summary} />
      <section className="section-wrap">
        <Breadcrumbs
          items={[
            { label: "Occasions", href: "/occasions" },
            { label: o.title, href: "/occasions/" + slug },
          ]}
        />
        <div className="story-split">
          <div className="story-image">
            <Image
              src={o.image}
              alt={o.alt}
              fill
              sizes="(max-width:760px) 100vw, 50vw"
            />
          </div>
          <div>
            <h2>{o.feeling}</h2>
            <p>{o.story}</p>
            <p className="eyebrow">A direction we can shape together</p>
            <ul className="care-list">
              {o.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
            <Link href="/contact" className="button-primary">
              Share your vision <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>
      <section className="bg-cream">
        <div className="section-wrap service-choice">
          <div>
            <p className="eyebrow">Before we begin</p>
            <h2>
              A little clarity.
              <br />
              <em>A lot of possibility.</em>
            </h2>
          </div>
          <div>
            <ul className="care-list">
              {o.prompts.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <p>
              Your inquiry helps us confirm availability, venue requirements,
              and the support that fits your celebration.
            </p>
            <Link href="/investment" className="text-link">
              How your proposal is shaped <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>
      <section className="section-wrap">
        <p className="eyebrow">A design example from our collection</p>
        <h2>See the details in a real event.</h2>
        <p>
          This example shows Radiant’s visual approach; your occasion receives
          its own design and scope.
        </p>
        <Link className="text-link" href={`/portfolio/${o.project}`}>
          View the project <ArrowIcon />
        </Link>
      </section>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: o.title,
          description: o.summary,
          url: absoluteUrl("/occasions/" + slug),
          areaServed: { "@type": "City", name: "Atlanta" },
          provider: { "@id": absoluteUrl("/#organization") },
        }}
      />
    </>
  );
}
