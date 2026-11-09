# Brand Implementation Notes

Current as of 2026-11-08. Owner: Rickya Fandino. Tagline: **Planning with Purpose. Serving with Grace.**

## Palette (olive and ivory)

Tokens live in `src/app/radiant-system.css` (`--rs-*`). Legacy Tailwind names in
`globals.css` (`aubergine`, `tangerine`, `cream`…) are remapped onto this palette and
should not be used for new work.

| Token | Hex | Use |
| --- | --- | --- |
| Olive | `#59664A` | Primary actions, accents, italic headline halves |
| Olive deep | `#35412E` | Hover states, closing bands |
| Ivory | `#F8F6EE` | Page background, text on dark |
| Sand | `#E3D6C6` | Warm surfaces, accents on dark |
| Sage | `#A7B096` | Borders, subtle surfaces |
| Taupe | `#B7A898` | Rules and dividers |
| Ink | `#2B2B26` | Body and display text |
| Mist | `#E7E8DC` | Tinted sections |

Every public page passes WCAG AA contrast (checked with a script in QA). Olive text
must never sit on an olive or olive-deep background.

## Typography

Self-hosted from `src/fonts/` (SIL OFL, see `OFL-LICENSES.txt`) via `next/font/local`.

- **Cormorant Garamond**: display headlines (weight 500, italic 400 for the second half).
- **Montserrat**: body copy, navigation, buttons, eyebrows.
- **Allura**: rare decorative accents only.

## Logo

`public/brand/radiant-olive-logo.webp` (round olive emblem). Used in the intro,
the header (46px) and the footer. Do not recolor, crop or outline it.

## Motion

One system for every page: `src/components/RadiantMotion.tsx` plus the motion block
in `radiant-system.css`. Opt in with `data-reveal`:

| Value | Effect |
| --- | --- |
| `""` | Rise and fade (default) |
| `"mask"` | Image revealed from a bottom mask, settling in scale |
| `"fade"` | Opacity only |
| `"stagger"` / `"lines"` | Direct children rise in sequence |

Headline lines use `.rm-line > span`. Hero photos are visible from the first frame
(no mask, it would delay LCP) and settle with a slow zoom-out. Everything respects
`prefers-reduced-motion`, content is visible without JavaScript, and anything
scrolled past is revealed immediately.

The first-visit intro (`BrandEntrance.tsx`) is armed by an inline script in
`layout.tsx` before first paint, plays once per session on `/`, can be skipped
(button or Escape), and releases the hero's entrance as the curtain lifts.

## Photography

Only real Radiant work. Hero crops are cut from the originals so no guest's face
is the focal point (`candlelight-tables.webp`). Alt text describes what is visible.

## Voice

Gracious, assured, refined, specific. No invented capabilities, vendor networks,
results, testimonials or prices.
