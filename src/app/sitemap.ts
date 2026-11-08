import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { occasions } from "@/content/occasions";
import { services } from "@/content/services";
import { portfolioProjects } from "@/content/portfolio";
import { journalArticles } from "@/content/journal";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/about",
    "/service-areas",
    "/services",
    "/portfolio",
    "/process",
    "/journal",
    "/contact",
    "/occasions",
    "/investment",
    "/faq",
    "/client-guide",
    // /privacy and /terms are noindex drafts until the owner approves them.
  ];

  const dynamicRoutes = [
    ...occasions.map((o) => `/occasions/${o.slug}`),
    ...services.map((s) => `/services/${s.slug}`),
    ...portfolioProjects.map((p) => `/portfolio/${p.slug}`),
    ...journalArticles.map((a) => `/journal/${a.slug}`),
  ];

  return [...staticRoutes, ...dynamicRoutes].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date("2026-11-08"),
  }));
}
