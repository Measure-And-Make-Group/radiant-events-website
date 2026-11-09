export const PORTFOLIO_CATEGORIES = [
  "Tablescapes + Room Styling",
  "Balloons + Backdrops",
  "Styled Moments",
] as const;

/** Gallery filters: one per kind of event REP has actually delivered. */
export const EVENT_TYPES = [
  "Showers",
  "Birthdays & milestones",
  "Church & ministry",
  "Launches & brand events",
  "Garlands & backdrops",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export type PortfolioProject = {
  slug: string;
  title: string;
  category: (typeof PORTFOLIO_CATEGORIES)[number];
  eventType: EventType;
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
// 2026-11-09 (afternoon): MMG reinstated the sweet sixteen and ministry
// backdrop projects so the portfolio shows the full range of REP's work.
// The doll-box photo booth frame stays out (toy-brand packaging).
// Roses & Shimmer (book launch) added 2026-11-09; publication approved by the
// owner for all photos in the Radiant Drive folder.
export const portfolioProjects: PortfolioProject[] = [
  {
    slug: "pearls-and-promise",
    title: "Pearls & Promise",
    category: "Balloons + Backdrops",
    eventType: "Showers",
    occasion: "Bridal shower",
    image: "/images/bridal-backdrop.webp",
    alt: "An ivory pearl balloon garland framing white backdrop panels with a script sign and blush roses",
    headline: ["Ivory, pearls", "and a little champagne."],
    gallery: [
      { src: "/images/bridal-backdrop.webp", alt: "An ivory pearl balloon garland framing white backdrop panels, a pleated pillar and blush rose clusters" },
      { src: "/images/bridal-sign.webp", alt: "Close view of the backdrop: a 'Forever Mrs.' script sign under a cluster of blush and ivory roses" },
      { src: "/images/bridal-champagne.webp", alt: "A champagne wall of gold-framed shelves on boxwood, with a coupe tower and a pearls of wisdom card station" },
      { src: "/images/bridal-dessert.webp", alt: "A dessert table with cupcakes, a white cake, roses in bud vases and wrapped favors" },
      { src: "/images/bridal-pearls.webp", alt: "A 'guess how many pearls' game with a jar of pearls, taper candles and single roses in glass vases" },
      { src: "/images/bridal-table.webp", alt: "A guest table with a rose and floating candle centerpiece in front of the pearl garland" },
    ],
    overview:
      "A bridal shower in ivory and pearl: a garland-framed photo backdrop, a champagne wall, and soft rose details carried from the welcome sign to the dessert table.",
    challenge:
      "Make a bright, open room feel elegant and celebratory, with a backdrop worthy of the bride's photos.",
    designDirection:
      "Pearl-finish balloons in mixed sizes frame white arched panels and a pleated pillar, with blush and ivory roses as the only color. Gold shelving, crystal vases and taper candles keep every station in the same soft palette.",
    servicesProvided: ["Balloon garland and backdrop", "Champagne wall styling", "Dessert and game table styling", "Florals and centerpieces"],
  },
  {
    slug: "candlelight-and-conversation",
    title: "Candlelight & Conversation",
    category: "Tablescapes + Room Styling",
    eventType: "Church & ministry",
    occasion: "Men's evening event",
    location: "Social House, Roswell, Georgia",
    headline: ["A neutral hall,", "transformed by candlelight."],
    image: "/images/candlelight-hall-warm.webp",
    alt: "Rows of long banquet tables dressed in black linen and lit by candles in an event hall",
    gallery: [
      { src: "/images/candlelight-hall-warm.webp", alt: "The full room: rows of long banquet tables dressed in black linen and candlelight" },
      { src: "/images/candlelight-tables-warm.webp", alt: "Banquet tables with gold chargers, greenery runners and rows of flameless candles" },
      { src: "/images/candlelight-detail-warm.webp", alt: "Navy plates on gold chargers with ribbon-tied napkins, tan runners and greenery" },
    ],
    overview:
      "An evening built around conversation. REP styled Social House, a blank-canvas event hall in historic downtown Roswell, into long, candlelit banquet tables meant for lingering.",
    challenge:
      "Seat a full room at long communal tables while keeping the setting warm, intimate and conversation-ready.",
    designDirection:
      "Black linens and tan runners ground the room. Gold chargers, navy plates and ribbon-tied napkins add polish, while greenery runners, small white florals and rows of candlelight bring the warmth.",
    servicesProvided: ["Full room design", "Tablescape styling", "Linens, place settings and centerpieces", "On-site setup"],
  },
  {
    slug: "roses-and-shimmer",
    title: "Roses & Shimmer",
    category: "Balloons + Backdrops",
    eventType: "Launches & brand events",
    occasion: "Book launch celebration",
    headline: ["A shimmer wall,", "framed in roses."],
    image: "/images/flower-wall.webp",
    alt: "A sequin shimmer wall in deep pink framed by a dense border of red, pink, coral and yellow roses, with script lettering",
    gallery: [
      { src: "/images/flower-wall.webp", alt: "A sequin shimmer wall in deep pink framed by a dense border of red, pink, coral and yellow roses, with script lettering" },
      { src: "/images/styled-table-detail.webp", alt: "A hot pink acrylic table sign on a pink sequin tablecloth with a gold rose keepsake" },
    ],
    overview:
      "A signature photo backdrop for a book launch: a shimmering sequin wall framed edge to edge in roses, with the book's title in script lettering.",
    challenge:
      "Give guests one unmistakable place to stop, celebrate and take a photograph.",
    designDirection:
      "Deep pink sequins catch the room light, while a full floral border in red, rose, coral and soft yellow adds depth and warmth. Script lettering ties the backdrop to the occasion.",
    servicesProvided: ["Floral frame backdrop", "Sequin shimmer wall", "Custom script lettering", "Installation"],
  },
  {
    slug: "pink-balloon-circle",
    title: "A Moment in Pink",
    category: "Balloons + Backdrops",
    eventType: "Birthdays & milestones",
    occasion: "Sweet sixteen celebration",
    location: "Private residence",
    image: "/images/pink-sixteen.webp",
    alt: "Pink balloon garland and ribbon streamers framing a gold circle, with marquee 16 numbers on a stone patio",
    headline: ["Sixteen, celebrated", "in every shade of pink."],
    gallery: [
      { src: "/images/pink-sixteen.webp", alt: "Pink balloon garland and ribbon streamers framing a gold circle, with marquee 16 numbers" },
      { src: "/images/pink-arch.webp", alt: "The pink balloon garland around the gold circular frame before the streamers went up" },
      { src: "/images/pink-install.webp", alt: "The garland mid-installation, with a step ladder still beside the gold frame" },
      { src: "/images/pink-balcony.webp", alt: "Pink balloon clusters along a wrought-iron balcony railing overlooking the garden" },
      { src: "/images/rose-centerpiece.webp", alt: "A blush and ivory rose centerpiece in a frosted pink vase on an ivory satin-draped table" },
    ],
    overview:
      "A sweet sixteen styled across a whole home: a pink balloon garland and ribbon backdrop on the patio, color carried up to the balcony, and soft rose centerpieces on the lawn.",
    challenge:
      "Give the birthday girl a signature photo moment while carrying the theme through every space guests would move through.",
    designDirection:
      "An asymmetric garland in blush, bubblegum and magenta around a slender gold circle, layered with satin and metallic ribbon streamers and lit marquee numbers. The same palette repeats on the balcony railing and in the rose centerpieces.",
    servicesProvided: ["Balloon garland and backdrop", "Ribbon streamer wall", "Marquee numbers", "Garden table styling", "Balcony garland"],
  },
  {
    slug: "game-night-balloon-moment",
    title: "Let the Games Begin",
    category: "Styled Moments",
    eventType: "Birthdays & milestones",
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
  {
    slug: "colorful-sequin-backdrop",
    title: "Color, Confetti & Joy",
    category: "Balloons + Backdrops",
    eventType: "Church & ministry",
    occasion: "Church ministry backdrop",
    image: "/images/colorful-wide.webp",
    alt: "Turquoise and lime balloon garlands framing a curved purple panel and a purple sequin wall",
    headline: ["Bold color,", "brought into balance."],
    gallery: [
      { src: "/images/colorful-wide.webp", alt: "Turquoise and lime balloon garlands framing a curved purple panel and a purple sequin wall" },
      { src: "/images/colorful-backdrop.webp", alt: "A closer view of the turquoise and lime clusters against the purple sequin wall" },
    ],
    overview:
      "A bright palette with a little shimmer. Turquoise and lime balloon garlands frame a purple focal wall for a playful, energetic ministry photo moment.",
    challenge:
      "Bring several bold colors together in one coordinated photo moment.",
    designDirection:
      "Turquoise and lime contrast against a curved purple panel and a reflective sequin surface.",
    servicesProvided: ["Balloon installation", "Backdrop styling"],
  },
];

export type AlbumPhoto = { src: string; alt: string; eventType: EventType };
export type Album = {
  id: string;
  title: string;
  occasion: string;
  blurb: string;
  /** Project story page, when the album has one. */
  href?: string;
  /** Short muted loop shown in the album's lead tile (web MP4 + poster). */
  video?: { src: string; poster: string };
  photos: AlbumPhoto[];
};

/**
 * Standalone installations from the shared "Decor" Drive folder (owner
 * approved for publication). Events are only named where the photo itself
 * shows the occasion; guest and client names never appear.
 */
const installations: AlbumPhoto[] = [
  { src: "/images/navy-garland.webp", alt: "A navy, black and gold balloon garland climbing a reclaimed-wood wall at Social House", eventType: "Garlands & backdrops" },
  { src: "/images/neutral-arch.webp", alt: "Ivory, nude and gold balloons framing a cream arched backdrop", eventType: "Garlands & backdrops" },
  { src: "/images/birthday-48.webp", alt: "Red, white and gold balloon garland around a silver sequin wall with gold 48 numbers", eventType: "Birthdays & milestones" },
  { src: "/images/navy-arch.webp", alt: "Navy, ivory and gold balloon clusters around a white arch against a wood-plank wall", eventType: "Garlands & backdrops" },
  { src: "/images/baby-bear.webp", alt: "A pink round backdrop reading 'We can bearly wait' with blush and tan balloons, baby blocks and a teddy bear", eventType: "Showers" },
  { src: "/images/ivory-column.webp", alt: "An ivory, nude and gold balloon garland rising beside a marble fireplace wall", eventType: "Garlands & backdrops" },
  { src: "/images/navy-garland-detail.webp", alt: "Close view of the navy, black and gold garland's layered balloon sizes", eventType: "Garlands & backdrops" },
  { src: "/images/neutral-arch-detail.webp", alt: "Gold chrome and ivory balloon clusters at the base of the cream arch", eventType: "Garlands & backdrops" },
  { src: "/images/navy-arch-side.webp", alt: "The navy and gold arch from the side, showing the garland's depth", eventType: "Garlands & backdrops" },
];

const projectAlbum = (slug: string, blurb: string): Album => {
  const p = portfolioProjects.find((x) => x.slug === slug)!;
  return {
    id: p.slug,
    title: p.title,
    occasion: p.occasion ?? p.category,
    blurb,
    href: "/portfolio/" + p.slug,
    photos: p.gallery.map((g) => ({ ...g, eventType: p.eventType })),
  };
};

/** The portfolio page, album by album, strongest work first. */
export const albums: Album[] = [
  projectAlbum("pearls-and-promise", "An ivory pearl garland, a champagne wall and blush roses at every station."),
  projectAlbum("candlelight-and-conversation", "Long candlelit banquet tables for an evening built around conversation."),
  {
    ...projectAlbum("pink-balloon-circle", "A garland and ribbon backdrop on the patio, with pink carried up to the balcony."),
    video: { src: "/video/album-pink-loop.mp4", poster: "/video/album-pink-loop.webp" },
  },
  {
    id: "garlands-and-backdrops",
    title: "Garlands & Backdrops",
    occasion: "Selected installations",
    blurb: "Organic balloon garlands in every palette, from navy and gold to soft neutrals and celebration red.",
    photos: installations,
  },
  projectAlbum("roses-and-shimmer", "A rose-framed shimmer wall made for one unforgettable photo."),
  projectAlbum("game-night-balloon-moment", "Purple, pink, black and silver with oversized dice at the door."),
  projectAlbum("colorful-sequin-backdrop", "Turquoise and lime garlands around a purple sequin wall."),
];

export const photoCount = albums.reduce((n, a) => n + a.photos.length, 0);

export function getProjectBySlug(slug: string) {
  return portfolioProjects.find((p) => p.slug === slug);
}
