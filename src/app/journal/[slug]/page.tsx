import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { pageMetadata, absoluteUrl } from "@/lib/seo";
import StructuredData from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import { journalArticles, getArticleBySlug } from "@/content/journal";

export function generateStaticParams() {
  return journalArticles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return pageMetadata(article.title, article.excerpt, "/journal/" + slug);
}

export default async function JournalArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const related = journalArticles
    .filter((a) => a.slug !== article.slug)
    .slice(0, 2);

  return (
    <article className="mx-auto max-w-2xl px-6 py-20">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.excerpt,
          url: absoluteUrl("/journal/" + slug),
          author: {
            "@type": "Organization",
            "@id": absoluteUrl("/#organization"),
            name: "Radiant Events Planning",
          },
          publisher: { "@id": absoluteUrl("/#organization") },
          mainEntityOfPage: absoluteUrl("/journal/" + slug),
        }}
      />
      <Breadcrumbs
        items={[
          { label: "Helpful Reads", href: "/journal" },
          { label: article.title, href: "/journal/" + slug },
        ]}
      />
      <div data-reveal="">
        <p className="font-sans uppercase tracking-wide-lg text-xs text-aubergine mb-3">
          {article.category} &middot; {article.readingTime}
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-ink mb-8">
          {article.title}
        </h1>
      </div>
      <div className="space-y-6">
        {article.body.map((paragraph, i) => (
          <div key={i} data-reveal="">
            <p className="font-sans text-ink leading-relaxed">{paragraph}</p>
          </div>
        ))}
      </div>

      {related.length > 0 && (
        <div className="mt-16 border-t border-taupe/40 pt-10">
          <h2 className="font-display text-2xl text-aubergine mb-6">
            Related Reading
          </h2>
          <ul className="space-y-3">
            {related.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/journal/${a.slug}`}
                  className="font-sans text-sm text-ink hover:text-aubergine underline decoration-tangerine underline-offset-4"
                >
                  {a.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-12">
        <Link
          href="/journal"
          className="font-sans text-sm uppercase tracking-wide-lg text-aubergine border-b border-tangerine hover:text-tangerine"
        >
          Back to Helpful Reads
        </Link>
      </div>
    </article>
  );
}
