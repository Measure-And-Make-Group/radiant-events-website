import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ArrowIcon from "@/components/ArrowIcon";
import PageHero from "@/components/sections/PageHero";
import StructuredData from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import { services, getServiceBySlug } from "@/content/services";
import { getProjectBySlug } from "@/content/portfolio";
import { pageMetadata, absoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  return pageMetadata(
    `${service.title} in Atlanta & North Atlanta`,
    service.summary,
    "/services/" + slug,
    service.image.src,
  );
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();
  const related = service.related
    .map((s) => getProjectBySlug(s))
    .filter((p): p is NonNullable<typeof p> => !!p);
  const others = services.filter((s) => s.slug !== slug);

  return (
    <div>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.title,
          serviceType: service.title,
          description: service.summary,
          url: absoluteUrl("/services/" + slug),
          image: absoluteUrl(service.image.src),
          provider: { "@id": absoluteUrl("/#organization") },
          areaServed: siteConfig.serviceAreas.map((name) => ({
            "@type": "City",
            name,
            containedInPlace: { "@type": "State", name: "Georgia" },
          })),
        }}
      />
      <PageHero
        eyebrow={`Services · ${service.tagline}`}
        title={service.title}
        subtitle={service.summary}
        image={service.image}
        actions={
          <Link href="/contact" className="button-primary">
            {siteConfig.primaryCta} <ArrowIcon />
          </Link>
        }
      />

      <section className="rs-section">
        <Breadcrumbs
          items={[
            { label: "Services", href: "/services" },
            { label: service.title, href: "/services/" + slug },
          ]}
        />
        <div className="rs-detail-grid" style={{ marginTop: 40 }}>
          <div data-reveal="">
            <p className="eyebrow">Is this the right fit?</p>
            <h2 className="rs-project-title">
              Who it’s <em>for.</em>
            </h2>
            <div className="rs-ideal">
              <strong>Best for</strong>
              {service.idealFor}
            </div>
            <h3>What you can expect</h3>
            <ul className="rs-list">
              {service.outcomes.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>
          <div data-reveal="">
            <h3>What can be included</h3>
            <ul className="rs-list">
              {service.includes.map((inc) => (
                <li key={inc}>{inc}</li>
              ))}
            </ul>
            <p className="rs-note">
              Every proposal is scoped to your event, so exactly what is
              included is confirmed with you before you book.
            </p>
          </div>
        </div>
      </section>

      <section className="rs-section rs-section-tint">
        <div className="rs-head" data-reveal="">
          <p className="eyebrow">How it works</p>
          <h2>
            From first idea <em>to finished room.</em>
          </h2>
        </div>
        <ol className="rs-steps">
          {service.process.map((step, i) => (
            <li className="rs-step rs-step-compact" key={step} data-reveal="">
              <span className="rs-step-number">{String(i + 1).padStart(2, "0")}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {related.length > 0 && (
        <section className="rs-section">
          <div className="rs-head" data-reveal="">
            <p className="eyebrow">In practice</p>
            <h2>
              Real REP <em>work.</em>
            </h2>
          </div>
          <div className="rs-related" data-reveal="stagger">
            {related.map((p) => (
              <Link href={"/portfolio/" + p.slug} key={p.slug}>
                <div className="rs-photo">
                  <Image src={p.image} alt={p.alt} fill sizes="(max-width: 860px) 100vw, 31vw" />
                </div>
                <span>{p.occasion ?? p.category}</span>
                <strong>{p.title}</strong>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="rs-section rs-section-sand">
        <div className="rs-detail-grid">
          <div data-reveal="">
            <p className="eyebrow">Good to know</p>
            <h2 className="rs-project-title">
              Questions, <em>answered.</em>
            </h2>
            <p className="rs-body">
              Also exploring{" "}
              {others.map((o, i) => (
                <span key={o.slug}>
                  <Link href={"/services/" + o.slug} className="rs-inline-link">{o.title}</Link>
                  {i < others.length - 1 ? " or " : "?"}
                </span>
              ))}
            </p>
          </div>
          <div className="rs-faq" data-reveal="">
            {service.faq.map((f) => (
              <details key={f.question}>
                <summary>{f.question}</summary>
                <p>{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="closing-cta">
        <p className="eyebrow">Let’s talk it through</p>
        <h2>
          Ready when <em>you are.</em>
        </h2>
        <p>
          Share your date, venue and what you’re imagining. We’ll recommend the
          right mix of support for your event.
        </p>
        <Link href="/contact" className="button-light">
          {siteConfig.primaryCta} <ArrowIcon />
        </Link>
      </section>
    </div>
  );
}
