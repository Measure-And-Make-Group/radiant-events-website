import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Portfolio",
  "Real Radiant Events Planning work across Atlanta and North Atlanta: tablescapes and full-room styling, balloon installations, backdrops and styled focal moments.",
  "/portfolio",
);

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
