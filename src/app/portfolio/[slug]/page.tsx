import ArrowIcon from "@/components/ArrowIcon";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PageHero from "@/components/sections/PageHero";
import Breadcrumbs from "@/components/Breadcrumbs";
import StructuredData from "@/components/StructuredData";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { portfolioProjects, getProjectBySlug } from "@/content/portfolio";

export function generateStaticParams() {
  return portfolioProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getProjectBySlug(slug);
  if (!p) return {};
  // "Venue, City, State" → "City" for the title.
  const parts = p.location?.split(",").map((x) => x.trim()) ?? [];
  const where = parts.length ? ` in ${parts[Math.max(0, parts.length - 2)]}` : "";
  const meta = pageMetadata(`${p.title}: ${p.category}${where}`, p.overview, "/portfolio/" + slug, p.image);
  // The portfolio layout sets its own title, which resets the root template.
  return { ...meta, title: { absolute: `${meta.title} | Radiant Events Planning` } };
}

export default async function Project({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getProjectBySlug(slug);
  if (!p) notFound();
  const index = portfolioProjects.findIndex((x) => x.slug === slug);
  const next = portfolioProjects[(index + 1) % portfolioProjects.length];
  const details = [
    ["Occasion", p.occasion],
    ["Location", p.location],
    ["Category", p.category],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <div>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: p.title,
          description: p.overview,
          image: absoluteUrl(p.image),
          url: absoluteUrl("/portfolio/" + slug),
          creator: { "@id": absoluteUrl("/#organization") },
          ...(p.location ? { locationCreated: { "@type": "Place", name: p.location } } : {}),
        }}
      />
      <PageHero
        eyebrow={p.category}
        title={p.title}
        subtitle={p.overview}
        image={{ src: p.image, alt: p.alt, caption: p.location ?? p.category }}
      />

      <section className="rs-section">
        <Breadcrumbs
          items={[
            { label: "Portfolio", href: "/portfolio" },
            { label: p.title, href: "/portfolio/" + slug },
          ]}
        />
        <div className="rs-detail-grid" style={{ marginTop: 40 }}>
          <div data-reveal="">
            <p className="eyebrow">The design story</p>
            <h2 className="rs-project-title">
              {p.headline[0]} <em>{p.headline[1]}</em>
            </h2>
            {details.length > 0 && (
              <dl className="rs-facts">
                {details.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          <div data-reveal="">
            <div className="rs-ideal">
              <strong>The intention</strong>
              {p.challenge}
            </div>
            <p className="rs-body">{p.designDirection}</p>
            <h3>What Radiant provided</h3>
            <ul className="rs-list">
              {p.servicesProvided.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <Link href="/contact" className="button-primary" style={{ marginTop: 32 }}>
              Plan something like this <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      {p.gallery.length > 1 && (
        <section className="rs-section rs-section-sand" aria-label={`${p.title} gallery`}>
          <div className={`rs-gallery rs-gallery-${Math.min(p.gallery.length - 1, 3)}`}>
            {p.gallery.slice(1).map((g) => (
              <figure key={g.src} className="rs-photo" data-reveal="mask">
                <Image src={g.src} alt={g.alt} fill sizes="(max-width: 860px) 100vw, 50vw" />
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className="rs-section rs-next">
        <Link href={"/portfolio/" + next.slug} className="rs-next-link" data-reveal="">
          <span className="eyebrow">Next project</span>
          <strong>
            {next.title} <ArrowIcon />
          </strong>
        </Link>
        <Link href="/portfolio" className="text-link">
          <ArrowIcon direction="left" /> All work
        </Link>
      </section>
    </div>
  );
}
