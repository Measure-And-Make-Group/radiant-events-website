import type { Metadata } from "next";
import { Allura, Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import BrandEntrance from "@/components/BrandEntrance";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { siteConfig } from "@/lib/site-config";
import { shareImage } from "@/lib/seo";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});
const allura = Allura({
  variable: "--font-allura",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Atlanta Event Planning & Design`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.oneLiner,
  openGraph: {
    title: `${siteConfig.name} | Atlanta Event Planning & Design`,
    description: siteConfig.oneLiner,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Atlanta Event Planning & Design`,
    description: siteConfig.oneLiner,
    images: [shareImage],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${montserrat.variable} ${allura.variable} h-full antialiased`}
    >
      <head>
        <link rel="preload" as="image" href="/brand/radiant-olive-logo.webp" />
      </head>
      <body className="min-h-full flex flex-col bg-cream-light text-ink">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:rounded-sm focus:bg-aubergine focus:px-4 focus:py-2 focus:text-cream-light focus:outline-2 focus:outline-tangerine"
        >
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": siteConfig.url + "/#organization",
                  name: "Radiant Events Planning",
                  alternateName: "Radiant Events",
                  url: siteConfig.url,
                  logo: siteConfig.url + "/brand/radiant-olive-logo.webp",
                  description: siteConfig.oneLiner,
                  areaServed: {
                    "@type": "City",
                    name: "Atlanta",
                    containedInPlace: { "@type": "State", name: "Georgia" },
                  },
                  sameAs: [siteConfig.social.instagram],
                  founder: { "@id": siteConfig.url + "/#rickya" },
                },
                {
                  "@type": "Person",
                  "@id": siteConfig.url + "/#rickya",
                  name: "Rickya Fandino",
                  jobTitle: "Founder",
                  url: siteConfig.url + "/about",
                  image: siteConfig.url + "/images/rickya-fandino.webp",
                  worksFor: { "@id": siteConfig.url + "/#organization" },
                },
                {
                  "@type": "WebSite",
                  "@id": siteConfig.url + "/#website",
                  url: siteConfig.url,
                  name: "Radiant Events Planning",
                  publisher: { "@id": siteConfig.url + "/#organization" },
                  inLanguage: "en-US",
                },
              ],
            }).replace(/</g, "\\u003c"),
          }}
        />
        <BrandEntrance />
        <SiteHeader />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
