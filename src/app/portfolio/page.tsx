"use client";
import ArrowIcon from "@/components/ArrowIcon";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import PageHero from "@/components/sections/PageHero";
import { PORTFOLIO_CATEGORIES, portfolioProjects } from "@/content/portfolio";

// Only show a filter when at least one project belongs to it.
const categories = [
  "All",
  ...PORTFOLIO_CATEGORIES.filter((c) => portfolioProjects.some((p) => p.category === c)),
];

export default function PortfolioPage() {
  const [filter, setFilter] = useState<string>("All");
  const selected = portfolioProjects.filter(
    (p) => filter === "All" || p.category === filter,
  );
  return (
    <div>
      <PageHero
        eyebrow="Portfolio"
        title={<>Real rooms. <em>Real celebrations.</em></>}
        subtitle="A closer look at REP's work across Atlanta and North Atlanta, from candlelit tablescapes and full-room styling to balloon installations and backdrops."
      />
      <section className="section-wrap">
        <div className="portfolio-filters" role="group" aria-label="Filter projects by category">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <h2 className="sr-only">Projects</h2>
        <p className="sr-only" aria-live="polite">
          Showing {selected.length} project{selected.length === 1 ? "" : "s"}
        </p>
        <div className="portfolio-grid">
          {selected.map((p) => (
            <Link key={p.slug} href={"/portfolio/" + p.slug} className="work-card">
              <div className="work-image">
                <Image src={p.image} alt={p.alt} fill sizes="(max-width:600px) 100vw, (max-width:900px) 50vw, 33vw" />
              </div>
              <div className="work-caption">
                <div>
                  <span className="eyebrow">{p.occasion ?? p.category}</span>
                  <h3>{p.title}</h3>
                </div>
                <ArrowIcon />
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="closing-cta">
        <p className="eyebrow">Your occasion, your way</p>
        <h2>
          What will your <em>moment look like?</em>
        </h2>
        <p>Tell us what you&apos;re celebrating, and we&apos;ll shape something personal.</p>
        <Link href="/contact" className="button-light">
          Start your event inquiry <ArrowIcon />
        </Link>
      </section>
    </div>
  );
}
