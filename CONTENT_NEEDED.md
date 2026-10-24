# Content Needed From the Owner

Nothing below was invented for the live site — every item here is a placeholder, clearly marked
in the UI, that must be replaced with real content before launch.

## Contact & Business Details
- [ ] Physical address, if any (many event businesses intentionally omit this)

## Social
- [ ] Instagram handle/URL
- [ ] Pinterest handle/URL
- [ ] Facebook page URL
- Add to `siteConfig.social` in `src/lib/site-config.ts`

## Portfolio
- [ ] Real event photography (currently gradient placeholder blocks in
      `src/components/PlaceholderMedia.tsx`)
- [ ] Real project details for each case study — replace entries in `src/content/portfolio.ts`
      (overview, challenge, design direction, services provided)
- [ ] Confirm licensing/usage rights for any photography before publishing

## Testimonials
- [ ] Real, attributable client quotes (name, event type — with permission to publish)
- Testimonials are currently **hidden** (`siteConfig.showTestimonials = false`) because none
  were supplied. Add real quotes to a `src/content/testimonials.ts` file and flip the flag once
  ready.

## Pricing
- [ ] Confirmed starting prices per service, if the business wants to publish any
- Currently withheld (`siteConfig.showPricing = false`)

## Founder / Team
- [ ] Founder biography and portrait for the About page (`src/app/about/page.tsx` has a clearly
      marked placeholder section)

## Legal
- [ ] Finalized Privacy Policy copy, reviewed by legal counsel (`src/app/privacy/page.tsx`)
- [ ] Finalized Terms of Service copy, reviewed by legal counsel (`src/app/terms/page.tsx`)

## Press / Credibility
- [ ] Any real press mentions, awards, or notable venues — do not add placeholder logos or
      claims. None currently exist on the site.

## Brand Assets
- [ ] Higher-resolution or alternate-format logo files, if available, beyond the one extracted
      from the brand deck (`public/brand/radiant-events-logo.png`)
- [ ] Any additional approved brand photography referenced in the brand deck but not included
      as separate image files
