# Deployment & Operations

## Hosting

- Vercel team `measure-and-make-group`, project `radiant-events-website`
  (`prj_enajP6PJ2oyd6qeLIzPwxDQRMRd1`), connected to GitHub
  `Measure-And-Make-Group/radiant-events-website`.
- Production branch: `main`. Production domain: `https://www.radianteventsplanning.com`.
  The apex `radianteventsplanning.com` redirects (308) to `www`. HTTPS is enforced.
- Preview deployments are created for other branches. They have `target: null` and are not
  served on the custom domain, so a branch deployment being `READY` does not mean it is live.
- DNS for the domain is hosted at Google Cloud DNS (Google Domains name servers). Google
  Workspace handles inbound mail (`MX smtp.google.com`).

### Rolling back

Vercel → project → **Deployments** → pick an earlier `Production` deployment that shows
**Rollback candidate** → **Promote to Production** (or use the `request_rollback` API/MCP tool).
Rollback changes only the served build; environment variables and stored inquiries are not
affected. Record the previous production deployment id before every release.

## Environment variables (Vercel → Settings → Environment Variables)

| Variable | Purpose |
| --- | --- |
| `BLOB_READ_WRITE_TOKEN` / `BLOB_STORE_ID` | Private Blob store for inquiries. Records are written with `access: "private"`. |
| `RESEND_API_KEY` | Resend key. A sending-only key is enough. |
| `INQUIRY_FROM_EMAIL` | Sender, e.g. `Radiant Events Planning <bookings@radianteventsplanning.com>`. The domain must be verified in Resend. |
| `INQUIRY_NOTIFICATION_EMAIL` | Where owner notifications and reminders go. It is also the default sign-in allow-list. |
| `INQUIRY_REPLY_TO` | Optional. Reply-to for client emails (defaults to `INQUIRY_NOTIFICATION_EMAIL`). |
| `INQUIRY_FORM_SECRET` | Secret (16+ chars) that signs form tokens, sign-in links and sessions. Rotating it signs everyone out and invalidates open forms. |
| `CRON_SECRET` | Vercel Cron sends it as a bearer token; the cron route refuses anything else. |
| `ADMIN_EMAILS` | Optional comma-separated allow-list for the inbox. Defaults to `INQUIRY_NOTIFICATION_EMAIL`. |
| `RESEND_WEBHOOK_SECRET` | Optional. Enables `/api/webhooks/resend` (see below). |
| `STRIPE_PAYMENT_LINK`, `STRIPE_DEPOSIT_PAYMENT_LINK` | Optional Stripe Payment Link URLs for `/payments`. |

Never commit secrets. `.env*` is ignored by git.

## What happens when someone submits an inquiry

1. The page fetches a signed token (`GET /api/inquiries/token`) and creates a random
   `submissionId` that is reused on retries.
2. `POST /api/inquiries` checks same-origin, JSON content type, body size, the full Zod schema,
   the honeypot (a filled hidden field gets a fake success and nothing is stored or sent), token
   validity and age (at least 4 seconds, at most 6 hours) and a limit of 8 submissions per hour
   per connection.
3. The inquiry is written to private Blob as `inquiries/RE-YYMMDD-XXXXXX.json`. The reference is
   derived from the `submissionId`, so a retry finds the same record and returns it (HTTP 200,
   `duplicate: true`) without storing or emailing again.
4. Only after storage succeeds, the owner notification and client confirmation are sent via
   Resend with idempotency keys `inquiry/<reference>/owner|customer`. The client sees success
   whenever the record is saved; the success screen says honestly whether the confirmation
   email was accepted.
5. Delivery state per email (`pending`/`sent`/`failed`, attempts, provider message id, last
   error, optional delivery event) is stored in the same record.

"Sent" means **Resend accepted the message**. It is not proof of inbox delivery. Delivery
events (`delivered`, `bounced`, ...) are recorded only when the webhook is connected.

### Recovering failed emails

- The daily cron (`vercel.json`, 13:00 UTC) retries any email not yet accepted (up to 5 tries).
- In the inbox, open an inquiry and use **Resend this email**. Idempotency keys stop duplicates.
- Records saved before this pipeline existed have no `emails` block. They are never emailed,
  retried or reminded automatically.

### Optional: Resend delivery webhook

In Resend → Webhooks add `https://www.radianteventsplanning.com/api/webhooks/resend`, select
the `email.*` events, copy the signing secret into `RESEND_WEBHOOK_SECRET`, and redeploy.
Signatures are verified (Svix HMAC, 5-minute tolerance); replays and out-of-order events are
harmless.

## Private inquiry inbox

- URL: `https://www.radianteventsplanning.com/admin/inquiries` (not linked anywhere, `noindex`,
  disallowed in `robots.txt`).
- Sign-in is passwordless. Enter an allow-listed address at `/admin/login`; a one-time link
  (valid 15 minutes, usable once) is emailed, and opening it asks you to click **Sign in**. The
  session cookie is HttpOnly, Secure and SameSite=Strict and lasts 12 hours.
- The inbox lists inquiries with reference, status and both email states, with a status filter.
  A detail page shows everything submitted, a status selector
  (New → Contacted → Consultation scheduled → Proposal sent → Booked / Closed with history),
  a private note, and resend buttons.
- It depends on the notification mailbox being readable. If that mailbox is lost, set
  `ADMIN_EMAILS` to another address you control.

## Automations that are active

| Trigger | Action |
| --- | --- |
| Inquiry submitted | Save, email owner, email client confirmation |
| Daily 13:00 UTC | Retry unsent emails; one internal reminder email for inquiries still **New** after 12 hours; purge expired rate-limit and login markers |
| Status changed in inbox | Recorded with timestamp (no automatic message) |

Reminders are sent at the next daily run after the 12-hour mark, so an inquiry can wait up to
about 36 hours before a reminder. Vercel Hobby only allows daily cron jobs; a Pro plan allows
an hourly schedule (change it in `vercel.json`).

### Deliberately not active

No client-facing follow-up sequences are active. Each needs a decision first:

- **Proposal reminders**: who sends proposals (this site, HoneyBook, or by hand) and the wait.
- **Event reminders, post-event thank-you, review request, photo permission**: approved wording,
  timing, and where event dates are recorded (the form captures free text, not a date).
- **HoneyBook**: no integration was found. Adding one needs an owner decision on whether
  HoneyBook (not this inbox) is the system of record for proposals and contracts.

## Payments (Stripe)

`/payments` shows buttons only when `STRIPE_DEPOSIT_PAYMENT_LINK` / `STRIPE_PAYMENT_LINK` hold
an `https://buy.stripe.com/...` or `checkout.stripe.com` URL; otherwise it tells booked clients
to request a link through the form. No Stripe link is configured in Vercel today. To enable:
create a custom-amount Payment Link in Stripe (a `buy.stripe.com/test_...` link is test mode;
live links have no `test_`), set the success/cancel behaviour in Stripe, and add the URL as an
environment variable. Do not state deposit percentages or refund rules until the owner has
approved booking terms. An inquiry never reserves a date.

## DNS and email

- Resend records exist for `radianteventsplanning.com`: `resend._domainkey` (DKIM) and
  `send.` (SPF + MX for bounces). Inbound MX is Google Workspace; do not change it.
- There is no DMARC record. Adding `_dmarc` TXT `v=DMARC1; p=none; rua=mailto:<mailbox>` is a
  low-risk improvement for deliverability.
- Resend verification only allows sending. It does not create or host a mailbox. The sender and
  reply-to address must exist as a mailbox or alias in Google Workspace for replies to arrive.

## Release checklist

- [ ] `npm run lint`, `npm run build`, `npm run test:inquiry` pass
- [ ] Note the current production deployment id (rollback target)
- [ ] Merge to `main` (or deploy the reviewed branch to production)
- [ ] Verify the deployment's commit matches, the domain serves it, and `/contact` loads
- [ ] Submit one clearly labelled test inquiry and confirm storage, both emails, and inbox display
- [ ] Real portfolio photography, privacy/terms review, and approved booking terms are in place
