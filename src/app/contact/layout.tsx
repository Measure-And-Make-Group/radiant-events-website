import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Start Your Event Inquiry",
  "Tell Radiant Events Planning about your celebration: your date, venue and vision. Planning, room styling and balloon installations across Atlanta and North Atlanta.",
  "/contact",
);

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
