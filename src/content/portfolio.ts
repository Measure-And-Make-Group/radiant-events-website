export const PORTFOLIO_CATEGORIES = [
  "Tablescapes + Room Styling",
  "Balloons + Backdrops",
  "Styled Moments",
] as const;

export type PortfolioProject = {
  slug: string;
  title: string;
  category: (typeof PORTFOLIO_CATEGORIES)[number];
  /** Optional, owner-approved context shown on the project page. */
  occasion?: string;
  location?: string;
  /** Project-specific heading for the story section. */
  headline: [string, string];
  image: string;
  alt: string;
  gallery: { src: string; alt: string }[];
  overview: string;
  challenge: string;
  designDirection: string;
  servicesProvided: string[];
};
// Authentic Radiant photographs. Descriptions cover visible design; no invented
// clients, venues, or outcomes. The Roswell project was approved for
// publication by MMG on 2026-11-08 (Radiant designed the full room; the venue
// may be credited, the host organization is intentionally not named).
// Client names, dates, ages, addresses and host branding are removed from all
// photos before publishing (signs inpainted, slides and book covers blurred).
export const portfolioProjects: PortfolioProject[] = [
  {
    slug: "candlelight-and-conversation",
    title: "Candlelight & Conversation",
    category: "Tablescapes + Room Styling",
    occasion: "Men's evening event",
    location: "Social House, Roswell, Georgia",
    headline: ["A neutral hall,", "transformed by candlelight."],
    image: "/images/candlelight-hall.webp",
    alt: "Rows of long banquet tables dressed in black linen and lit by candles in an event hall",
    gallery: [
      { src: "/images/candlelight-hall.webp", alt: "The full room: rows of long banquet tables dressed in black linen and candlelight" },
      { src: "/images/candlelight-tables.webp", alt: "Banquet tables with gold chargers, greenery runners and rows of flameless candles" },
      { src: "/images/candlelight-detail.webp", alt: "Navy plates on gold chargers with ribbon-tied napkins, tan runners and greenery" },
    ],
    overview:
      "An evening built around conversation. Radiant styled Social House, a blank-canvas event hall in historic downtown Roswell, into long, candlelit banquet tables meant for lingering.",
    challenge:
      "Seat a full room at long communal tables while keeping the setting warm, intimate and conversation-ready.",
    designDirection:
      "Black linens and tan runners ground the room. Gold chargers, navy plates and ribbon-tied napkins add polish, while greenery runners, small white florals and rows of candlelight bring the warmth.",
    servicesProvided: ["Full room design", "Tablescape styling", "Linens, place settings and centerpieces", "On-site setup"],
  },
  {
    slug: "pink-balloon-circle",
    title: "A Moment in Pink",
    category: "Balloons + Backdrops",
    image: "/images/pink-arch.webp",
    alt: "Pink balloon clusters framing a gold circular backdrop",
    headline: ["A sculptural frame,", "softened in pink."],
    gallery: [{ src: "/images/pink-arch.webp", alt: "Pink balloon clusters framing a gold circular backdrop" }],
    overview:
      "Soft pink meets a sculptural silhouette. An open circular frame gives this balloon installation a light, playful presence.",
    challenge:
      "Create a defined focal moment while keeping the center open for photographs.",
    designDirection:
      "Pink balloons in varied sizes, gathered asymmetrically around a slender gold circle.",
    servicesProvided: ["Balloon installation", "Circular backdrop styling"],
  },
  {
    slug: "colorful-sequin-backdrop",
    title: "Color, Confetti & Joy",
    category: "Balloons + Backdrops",
    occasion: "Church ministry backdrop",
    image: "/images/colorful-backdrop.webp",
    alt: "Turquoise and lime balloon clusters beside a purple sequin backdrop",
    headline: ["Bold color,", "brought into balance."],
    gallery: [
      { src: "/images/colorful-backdrop.webp", alt: "Turquoise and lime balloon clusters beside a purple sequin backdrop" },
      { src: "/images/colorful-detail.webp", alt: "Wider view of turquoise and lime balloon garlands around a purple sequin wall and curved purple panel" },
    ],
    overview:
      "A bright palette with a little shimmer. Turquoise and lime balloon clusters frame a purple focal wall for a playful, energetic setting.",
    challenge:
      "Bring several bold colors together in one coordinated photo moment.",
    designDirection:
      "Turquoise and lime contrast against purple panels and a reflective sequin surface.",
    servicesProvided: ["Balloon installation", "Backdrop styling"],
  },
  {
    slug: "game-night-balloon-moment",
    title: "Let the Games Begin",
    category: "Styled Moments",
    occasion: "Birthday game night",
    image: "/images/game-night.webp",
    alt: "Purple, pink, black and silver balloons with oversized dice at a game night display",
    headline: ["An entrance that", "announces the theme."],
    gallery: [
      { src: "/images/game-night.webp", alt: "Purple, pink, black and silver balloons with oversized dice at a game night entrance" },
      { src: "/images/game-night-detail.webp", alt: "Pink, purple, black and silver balloon column beside a game night welcome sign and stacked oversized dice" },
    ],
    overview:
      "A celebration with personality. Rich purple, pink, black, and silver balloons pair with playful oversized dice and a themed welcome moment.",
    challenge:
      "Make the entrance feel like part of the celebration, with a theme visitors recognize at a glance.",
    designDirection:
      "A vertical balloon composition and graphic game-inspired accents keep the focal area expressive and cohesive.",
    servicesProvided: ["Balloon installation", "Themed focal-area styling"],
  },
];
export function getProjectBySlug(slug: string) {
  return portfolioProjects.find((p) => p.slug === slug);
}
