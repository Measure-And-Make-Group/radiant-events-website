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
  /** Optional short, silent behind-the-scenes loop. */
  video?: { src: string; poster: string; caption: string };
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
// Curated 2026-11-09: the owner rejected the "A Moment in Pink" photography
// for the premium portfolio, so that project (like the colorful backdrop
// before it) is no longer published. Fewer, stronger projects by design.
// Roses & Shimmer (book launch) added 2026-11-09; publication approved by the
// owner for all photos in the Radiant Drive folder.
export const portfolioProjects: PortfolioProject[] = [
  {
    slug: "pearls-and-champagne",
    title: "Pearls & Champagne",
    category: "Tablescapes + Room Styling",
    occasion: "Bridal shower",
    headline: ["Pearls, roses", "and a champagne toast."],
    image: "/images/pearls-centerpiece.webp",
    alt: "A blush rose and white taper candle centerpiece on an ivory table scattered with pearls, with a pearl balloon backdrop behind",
    gallery: [
      { src: "/images/pearls-centerpiece.webp", alt: "A blush rose and white taper candle centerpiece on an ivory table scattered with pearls, with a pearl balloon backdrop behind" },
      { src: "/images/pearls-champagne-wall.webp", alt: "A boxwood champagne wall with gold shelving, a coupe tower draped in pearls, mini champagne favors and a gold card box" },
      { src: "/images/pearls-dessert-table.webp", alt: "Cupcakes with pearl-topped frosting, roses in clear glass and wrapped favor cones on an ivory dessert table" },
      { src: "/images/pearls-guess-table.webp", alt: "A guess-how-many-pearls game with a jar of pearls, bud vases of roses and white taper candles on a pearl-dotted table" },
    ],
    overview:
      "A bridal shower in ivory, blush and pearl: rose and candle centerpieces on pearl-scattered tulle, a champagne wall framed in gold, and a dessert table dressed to match.",
    challenge:
      "Keep every station, from the tables to the desserts, games and champagne wall, in one soft and cohesive palette.",
    designDirection:
      "Ivory linens layered with pearl-dotted tulle, blush and ivory roses in clear glass, white taper candles and gold accents. Pearl balloons frame the backdrop, while a coupe tower and gold shelving turn the champagne wall into a focal point.",
    servicesProvided: ["Table and centerpiece styling", "Champagne wall and coupe tower", "Dessert and favor table styling", "Guest activity station", "Pearl balloon backdrop"],
  },
  {
    slug: "candlelight-and-conversation",
    title: "Candlelight & Conversation",
    category: "Tablescapes + Room Styling",
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
    occasion: "Book launch celebration",
    headline: ["A shimmer wall,", "framed in roses."],
    image: "/images/flower-wall-launch.webp",
    alt: "A deep pink sequin shimmer wall framed in red, pink, coral and yellow roses, with script lettering, beside racks of launch apparel",
    gallery: [
      { src: "/images/flower-wall-launch.webp", alt: "A deep pink sequin shimmer wall framed in red, pink, coral and yellow roses, with script lettering, beside racks of launch apparel" },
      { src: "/images/flower-wall.webp", alt: "A sequin shimmer wall in deep pink framed by a dense border of red, pink, coral and yellow roses, with script lettering" },
      { src: "/images/launch-merch-display.webp", alt: "A bamboo shelf display of the book, mugs, caps, tote bags and shirts in pink and white" },
    ],
    video: { src: "/images/flower-wall-install.mp4", poster: "/images/flower-wall-install.webp", caption: "Behind the scenes: the rose frame going up" },
    overview:
      "A signature photo backdrop for a book launch: a shimmering sequin wall framed edge to edge in roses, with the book's title in script lettering.",
    challenge:
      "Give guests one unmistakable place to stop, celebrate and take a photograph.",
    designDirection:
      "Deep pink sequins catch the room light, while a full floral border in red, rose, coral and soft yellow adds depth and warmth. Script lettering ties the backdrop to the occasion.",
    servicesProvided: ["Floral frame backdrop", "Sequin shimmer wall", "Custom script lettering", "Installation"],
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
  {
    slug: "race-day",
    title: "Race Day",
    category: "Balloons + Backdrops",
    occasion: "Birthday celebration",
    headline: ["A finish line", "made for the birthday boy."],
    image: "/images/race-day-backdrop.webp",
    alt: "A checkered black and silver foil balloon wall with a Cars-style name sign, framed by red, black and white balloon garlands and race-car cutouts",
    gallery: [{ src: "/images/race-day-backdrop.webp", alt: "A checkered black and silver foil balloon wall with a Cars-style name sign, framed by red, black and white balloon garlands and race-car cutouts" }],
    overview:
      "A racing-themed birthday backdrop: a checkered-flag wall of black and silver foil balloons, a custom name sign, and red, black and white garlands framing favorite characters.",
    challenge:
      "Bring a child's favorite movie into the room with a backdrop that feels bold, playful and ready for photos.",
    designDirection:
      "Square foil balloons in alternating black and silver form the checkered flag, finished with a name sign in the film's style. Asymmetric garlands in red, black and white frame the wall, with character cutouts at its base.",
    servicesProvided: ["Foil balloon wall", "Balloon garlands", "Custom name sign", "Themed backdrop styling"],
  },
  {
    slug: "sweet-arrivals",
    title: "Sweet Arrivals",
    category: "Balloons + Backdrops",
    occasion: "Baby showers",
    headline: ["Two showers,", "two soft palettes."],
    image: "/images/baby-bearly-wait.webp",
    alt: "A blush round backdrop wrapped in pink, cream and caramel balloons with We Can Bearly Wait lettering, baby blocks and a teddy bear",
    gallery: [
      { src: "/images/baby-bearly-wait.webp", alt: "A blush round backdrop wrapped in pink, cream and caramel balloons with We Can Bearly Wait lettering, baby blocks and a teddy bear" },
      { src: "/images/baby-clouds.webp", alt: "Marquee BABY letters beside a white arch with paper clouds and a pastel balloon bouquet held by a teddy bear" },
    ],
    overview:
      "Two baby showers with a teddy bear theme: a blush round backdrop wrapped in organic balloon clusters, and a white arch with paper clouds and a floating balloon bouquet.",
    challenge:
      "Create a photo-ready corner that feels sweet and soft rather than busy.",
    designDirection:
      "Blush, cream and caramel balloons in organic clusters, script lettering and baby blocks for one shower; paper clouds, marquee BABY letters and a pastel bouquet for the other. An oversized teddy bear ties each scene together.",
    servicesProvided: ["Balloon garland and bouquet", "Round and arch backdrops", "Marquee letters and baby blocks", "Custom lettering"],
  },
  {
    slug: "under-the-lights",
    title: "Under the Lights",
    category: "Styled Moments",
    occasion: "Marriage proposal",
    headline: ["A question,", "spelled out in light."],
    image: "/images/marry-me-marquee.webp",
    alt: "Giant marquee letters spelling MARRY ME glowing at dusk, with string lights, white balloons and red rose petals",
    gallery: [{ src: "/images/marry-me-marquee.webp", alt: "Giant marquee letters spelling MARRY ME glowing at dusk, with string lights, white balloons and red rose petals" }],
    overview:
      "An outdoor proposal set for dusk: giant marquee letters spelling MARRY ME, string lights overhead, white balloons and a scatter of rose petals.",
    challenge:
      "Make one moment unforgettable, and easy to photograph after dark.",
    designDirection:
      "Warm marquee bulbs glow against the evening trees, with red rose petals across the patio, white balloon clusters and a red rose bouquet for the question itself.",
    servicesProvided: ["Marquee letter installation", "Rose petal styling", "Balloon accents", "Evening setup"],
  },
  {
    slug: "gift-wrapped-welcome",
    title: "A Gift-Wrapped Welcome",
    category: "Styled Moments",
    occasion: "Community Christmas celebration",
    headline: ["An entrance", "wrapped for Christmas."],
    image: "/images/gift-box-arch.webp",
    alt: "An entrance arch built from stacked gift-wrapped boxes in red, white and grey patterns beside a lit Christmas tree",
    gallery: [{ src: "/images/gift-box-arch.webp", alt: "An entrance arch built from stacked gift-wrapped boxes in red, white and grey patterns beside a lit Christmas tree" }],
    overview:
      "A holiday entrance built from stacked, gift-wrapped boxes that arch over the doorway beside a twinkling tree.",
    challenge:
      "Turn an everyday entrance into the first festive moment guests walk through.",
    designDirection:
      "Mixed wrapping papers in gingham, stripes, snowflakes and vintage trucks, stacked at playful angles into two columns and a lintel, with greenery above.",
    servicesProvided: ["Gift-box arch installation", "Seasonal entrance styling"],
  },
];
export function getProjectBySlug(slug: string) {
  return portfolioProjects.find((p) => p.slug === slug);
}
