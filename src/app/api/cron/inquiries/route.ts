import { timingSafeEqual } from "node:crypto";
import { emailConfig, sendEmail } from "@/lib/email";
import {
  deliverInquiryEmails,
  needsEmailRetry,
  reminderEmail,
} from "@/lib/inquiry-emails";
import { listInquiries, purgeOld, updateInquiry } from "@/lib/inquiry-store";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const REMINDER_AFTER_MS = 12 * 60 * 60 * 1000;

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  const given = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  return (
    !!secret &&
    given.length === expected.length &&
    timingSafeEqual(Buffer.from(given), Buffer.from(expected))
  );
}

/**
 * Daily housekeeping (Vercel Cron):
 * 1. retry transactional emails the provider has not yet accepted;
 * 2. send one internal reminder for inquiries still "new" after 12 hours;
 * 3. delete expired rate-limit and one-time-login markers.
 * Legacy records without an `emails` block are never touched.
 */
export async function GET(request: Request) {
  if (!authorized(request)) return new Response("Unauthorized", { status: 401 });
  const records = await listInquiries();
  let retried = 0;
  for (const record of records) {
    if (!needsEmailRetry(record, 10 * 60 * 1000)) continue;
    await deliverInquiryEmails(record).catch(() => undefined);
    retried++;
  }

  let reminded = 0;
  const config = emailConfig();
  const due = records.filter(
    (r) =>
      r.emails &&
      r.status === "new" &&
      !r.reminderSentAt &&
      Date.now() - Date.parse(r.receivedAt) > REMINDER_AFTER_MS,
  );
  if (config && due.length) {
    const built = reminderEmail(due);
    const result = await sendEmail({
      ...built,
      to: config.ownerTo,
      idempotencyKey: `reminder/${due.map((r) => r.reference).sort().join(",")}`.slice(0, 250),
    });
    if (result.ok) {
      const at = new Date().toISOString();
      await Promise.all(
        due.map((r) =>
          updateInquiry(r.reference, (x) => {
            x.reminderSentAt = at;
          }),
        ),
      );
      reminded = due.length;
    }
  }

  const purged =
    (await purgeOld("ratelimit/", 2 * 86_400_000)) +
    (await purgeOld("admin/", 2 * 86_400_000));
  return Response.json({ inquiries: records.length, retried, reminded, purged });
}
