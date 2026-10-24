export const siteConfig = {
  name: "Radiant Events",
  location: "Atlanta, Georgia",
  tagline: "Planning with Purpose. Serving with Grace.",
  positioning: "Beauty without the burden.",
  oneLiner:
    "Event planning, design, custom balloon installations, and backdrops in Atlanta, Georgia. Personal celebrations, thoughtful details, and beauty without the burden.",
  url: "https://www.radianteventsplanning.com",
  // No public phone number or email is listed; clients reach us via /contact.
  // No social handles were supplied.
  social: {
    instagram: "https://www.instagram.com/radiant.events.planning/" as
      string | null,
    pinterest: null as string | null,
    facebook: null as string | null,
  },
  // Keep testimonials hidden until genuine, attributable quotes are provided.
  showTestimonials: false,
  // No confirmed starting prices were supplied.
  showPricing: false,
  primaryCta: "Start Your Event Inquiry",
  secondaryCta: "Explore Our Work",
  nav: [
    { href: "/services", label: "Services" },
    { href: "/occasions", label: "Occasions" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/process", label: "Process" },
    { href: "/about", label: "About" },
  ],
  footerLegal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
  budgetRanges: [
    "Under $500",
    "$500 – $1,000",
    "$1,000 – $2,500",
    "$2,500 – $5,000",
    "$5,000+",
    "Need guidance",
  ],
  eventTypes: [
    "Wedding",
    "Corporate Event",
    "Private / Social Celebration",
    "Other",
  ],
  servicesOfInterest: [
    "Planning + Coordination",
    "Design + Room Styling",
    "Signature Installations",
    "Not sure yet",
  ],
  referralSources: [
    "Instagram",
    "Pinterest",
    "Google Search",
    "Referral from a friend or vendor",
    "Other",
  ],
} as const;

export type SiteConfig = typeof siteConfig;
