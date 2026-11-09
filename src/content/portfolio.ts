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
    occasion: "Sweet sixteen celebration",
    location: "Private residence",
    image: "/images/pink-sixteen.webp",
    alt: "Pink balloon garland and ribbon streamers framing a gold circle, with marquee 16 numbers on a stone patio",
    headline: ["Sixteen, celebrated", "in every shade of pink."],
    gallery: [
      { src: "/images/pink-sixteen.webp", alt: "Pink balloon garland and ribbon streamers framing a gold circle, with marquee 16 numbers" },
      { src: "/images/pink-arch.webp", alt: "The pink balloon garland around the gold circular frame before the streamers went up" },
      { src: "/images/pink-garden.webp", alt: "A pink doll-box photo booth on the lawn, a balcony balloon garland and a rose centerpiece" },
      { src: "/images/pink-balcony.webp", alt: "Pink balloon clusters along a wrought-iron balcony railing overlooking the garden" },
    ],
    overview:
      "A sweet sixteen styled across a whole home: a pink balloon garland and ribbon backdrop on the patio, a photo booth on the lawn, and color carried up to the balcony.",
    challenge:
      "Give the birthday girl a signature photo moment while carrying the theme through every space guests would move through.",
    designDirection:
      "An asymmetric garland in blush, bubblegum and magenta around a slender gold circle, layered with satin and metallic ribbon streamers and lit marquee numbers. The same palette repeats on the balcony railing and in a rose centerpiece.",
    servicesProvided: ["Balloon garland and backdrop", "Ribbon streamer wall", "Marquee numbers", "Photo booth and garden styling", "Balcony garland"],
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
