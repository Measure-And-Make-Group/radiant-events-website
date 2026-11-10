import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import PageHero from "@/components/sections/PageHero";
import { journalArticles } from "@/content/journal";

export const metadata = pageMetadata(
  "Helpful Reads",
  "Planning education, design inspiration, and venue insights from Radiant Events.",
  "/journal",
);

export default function JournalPage() {
  return (
    <div>
      <PageHero
        eyebrow="Helpful Reads"
        title="Notes on Planning & Design"
        subtitle="Practical guidance and design thinking for hosts planning a celebration of their own."
        mediaIndex={0}
      />

      <section className="mx-auto max-w-4xl px-6 py-16 space-y-12">
        {journalArticles.map((article) => (
          <div key={article.slug} data-reveal="">
            <Link href={`/journal/${article.slug}`} className="group block">
              <p className="font-sans uppercase tracking-wide-lg text-xs text-aubergine mb-2">
                {article.category} &middot; {article.readingTime}
              </p>
              <h2 className="font-display text-3xl text-ink group-hover:text-aubergine transition-colors mb-2">
                {article.title}
              </h2>
              <p className="font-sans text-sm text-stone leading-relaxed">
                {article.excerpt}
              </p>
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
}
