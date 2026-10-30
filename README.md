# Radiant Events — Website

Production website for **Radiant Events**, an Atlanta-based event planning and design company.
Built with Next.js (App Router), TypeScript, Tailwind CSS, and Framer Motion.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type-check without emitting |

## Project Structure

```
src/
  app/            Routes, layouts, metadata, sitemap/robots
  components/     Header, footer, shared UI
    motion/        Framer Motion reveal/stagger primitives
    sections/      Reusable page sections (hero, etc.)
  content/        Typed local content (services, portfolio, journal)
  lib/            site-config.ts (single source of truth), validation
```

## Content & Configuration

All business details — navigation, contact info, budget ranges, CTAs, feature flags — live in
[`src/lib/site-config.ts`](src/lib/site-config.ts). Update copy and structural content in
[`src/content/`](src/content/) rather than editing page components directly where possible.

See [`CONTENT_NEEDED.md`](CONTENT_NEEDED.md) for what the business owner still needs to supply
before launch (real contact info, portfolio photography, testimonials, legal copy).

See [`BRAND_IMPLEMENTATION.md`](BRAND_IMPLEMENTATION.md) for the brand system (colors, type,
motion rules) as implemented in code.

See [`DEPLOYMENT.md`](DEPLOYMENT.md) for deploying to Vercel, environment variables, and a launch
checklist.

## Current State

- Content is typed and local (`src/content/`); no CMS is wired up.
- The contact page uses the native four-step `InquiryForm`, which posts to `POST /api/inquiries`.
  Inquiries are validated on the server, saved to a **private** Vercel Blob store, and then two
  transactional emails are sent through Resend (owner notification and client confirmation).
- A passwordless private inbox lives at `/admin/inquiries` (see `DEPLOYMENT.md`).
- Public phone numbers and email addresses are intentionally not listed; clients use the form.
- Testimonials and published pricing stay hidden (`siteConfig.showTestimonials`,
  `siteConfig.showPricing`) until approved content exists.

## Inquiry system at a glance

| Piece | File |
| --- | --- |
| Form (client) | `src/components/InquiryForm.tsx` |
| Validation (shared client/server) | `src/lib/inquiry-schema.ts` |
| Submit handler | `src/app/api/inquiries/route.ts` |
| Storage (private Blob, ETag-safe updates) | `src/lib/inquiry-store.ts` |
| Email templates + delivery state | `src/lib/inquiry-emails.ts`, `src/lib/email.ts` |
| Tokens / admin session | `src/lib/auth.ts` |
| Inbox UI and actions | `src/app/admin/**`, `src/app/api/admin/**` |
| Daily retry + reminder job | `src/app/api/cron/inquiries/route.ts`, `vercel.json` |
| Delivery webhook (optional) | `src/app/api/webhooks/resend/route.ts` |

### Testing

```bash
npm run lint && npm run build
npm run test:inquiry   # starts next dev + a mock Resend API; sends no real email
```

`test:inquiry` covers valid, invalid, missing-consent, honeypot, duplicate, storage-failure,
email-failure-then-recovery, reminder, admin protection, magic-link sign-in, webhook signature
and rate-limit cases. It uses a local directory instead of Blob, so Blob-specific behaviour
must still be confirmed on a deployment.
