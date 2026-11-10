import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
export const shareImage = {
  url: siteConfig.url + "/brand/og-image.png",
  width: 1200,
  height: 630,
  alt: "Radiant Events Planning logo",
};
export function pageMetadata(
  title: string,
  description: string,
  path: string,
  image?: string,
): Metadata {
  const images = image
    ? [{ url: siteConfig.url + image, alt: `${title} by Radiant Events Planning` }]
    : [shareImage];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url: path,
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
      images,
    },
  };
}
export function absoluteUrl(path: string) {
  return new URL(path, siteConfig.url).href;
}
