import { createHmac, randomUUID } from "node:crypto";
import { authConfigured, formTokenAge } from "@/lib/auth";
import { deliverInquiryEmails } from "@/lib/inquiry-emails";
import { inquirySchema } from "@/lib/inquiry-schema";
import {
  createInquiry,
  incrementCounter,
  referenceFor,
  submissionKeyOf,
} from "@/lib/inquiry-store";
import type { InquiryRecord } from "@/lib/inquiry-types";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BODY_BYTES = 24_000;
const MIN_FORM_AGE_MS = 4_000;
const MAX_FORM_AGE_MS = 6 * 60 * 60 * 1000;
const MAX_SUBMISSIONS_PER_IP_PER_HOUR = 8;

const reply = (body: object, status: number) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function clientHash(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return createHmac("sha256", process.env.INQUIRY_FORM_SECRET || "local")
    .update(ip)
    .digest("hex")
    .slice(0, 24);
}

export async function POST(request: Request) {
  if (!sameOrigin(request))
    return reply({ error: "Please submit from the Radiant website." }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return reply({ error: "Invalid request format." }, 415);
  if (!authConfigured())
    return reply(
      { error: "We couldn't send your inquiry. Please try again in a moment." },
      503,
    );

  let payload: unknown;
  try {
    const text = await request.text();
    if (Buffer.byteLength(text) > MAX_BODY_BYTES)
      return reply({ error: "Your message is too long." }, 413);
    payload = JSON.parse(text);
  } catch {
    return reply({ error: "Invalid request format." }, 400);
  }

  const result = inquirySchema.safeParse(payload);
  if (!result.success)
    return reply(
      {
        error: "Please review your details.",
        fields: result.error.flatten().fieldErrors,
      },
      400,
    );
  const { company, submissionId, token, consent: _consent, ...details } =
    result.data;
  void _consent;

  // Honeypot: real visitors never see this field. Pretend success, store and
  // email nothing, so a bot learns nothing from the response.
  if (company) return reply({ reference: referenceFor(randomUUID()) }, 201);

  if (!submissionId)
    return reply({ error: "Please refresh the page and try again." }, 400);
  const age = formTokenAge(token);
  if (age === null || age > MAX_FORM_AGE_MS)
    return reply(
      {
        code: "session",
        error: "This page was open for a while. Please press send once more.",
      },
      400,
    );
  if (age < MIN_FORM_AGE_MS)
    return reply({ error: "Please take a moment, then send again." }, 429);

  const hour = new Date().toISOString().slice(0, 13).replace(/\D/g, "");
  try {
    const count = await incrementCounter(
      `ratelimit/submit-${clientHash(request)}-${hour}`,
    );
    if (count > MAX_SUBMISSIONS_PER_IP_PER_HOUR)
      return reply(
        { error: "Too many submissions. Please try again later." },
        429,
      );
  } catch {
    // A rate-limit storage hiccup must not block a genuine inquiry.
  }

  const key = submissionKeyOf(submissionId);
  const now = new Date().toISOString();
  let record: InquiryRecord;
  let duplicate: boolean;
  try {
    ({ record, duplicate } = await createInquiry(
      (reference): InquiryRecord => ({
        reference,
        receivedAt: now,
        status: "new",
        statusHistory: [{ status: "new", at: now }],
        submissionKey: key,
        consentAt: now,
        details: { ...details, phone: details.phone || undefined },
        emails: {
          owner: { status: "pending", attempts: 0 },
          customer: { status: "pending", attempts: 0 },
        },
      }),
      key,
    ));
  } catch (error) {
    console.error("Inquiry storage failed", (error as Error)?.name);
    return reply(
      { error: "We couldn't send your inquiry. Please try again in a moment." },
      503,
    );
  }

  // A retry of an already-stored submission never triggers new emails here;
  // anything still unsent is picked up by the retry cron or the admin inbox.
  if (!duplicate) {
    try {
      record = await deliverInquiryEmails(record);
    } catch {
      console.error("Inquiry email step failed");
    }
  }
  return reply(
    {
      reference: record.reference,
      duplicate,
      confirmationEmail:
        record.emails?.customer.status === "sent" ? "sent" : "pending",
    },
    duplicate ? 200 : 201,
  );
}
