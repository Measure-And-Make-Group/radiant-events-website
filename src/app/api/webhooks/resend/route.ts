import { createHmac, timingSafeEqual } from "node:crypto";
import { updateInquiry } from "@/lib/inquiry-store";

export const runtime = "nodejs";

const TOLERANCE_MS = 5 * 60 * 1000;
const RANK: Record<string, number> = {
  "email.sent": 1,
  "email.delivery_delayed": 2,
  "email.delivered": 3,
  "email.complained": 4,
  "email.bounced": 4,
  "email.failed": 4,
};

/** Svix signature check (Resend signs webhooks with Svix). */
function verified(id: string, timestamp: string, body: string, header: string) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret || !id || !timestamp || !header) return false;
  const ts = Number(timestamp) * 1000;
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > TOLERANCE_MS) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key)
    .update(`${id}.${timestamp}.${body}`)
    .digest("base64");
  return header.split(" ").some((part) => {
    const [version, signature] = part.split(",");
    if (version !== "v1" || !signature) return false;
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  });
}

/**
 * Records provider delivery events (delivered, bounced, ...) against the
 * inquiry that the message was tagged with. Replays and out-of-order events
 * are harmless: a lower-ranked event never overwrites a higher-ranked one.
 */
export async function POST(request: Request) {
  const body = await request.text();
  if (
    !verified(
      request.headers.get("svix-id") ?? "",
      request.headers.get("svix-timestamp") ?? "",
      body,
      request.headers.get("svix-signature") ?? "",
    )
  )
    return new Response("Invalid signature", { status: 401 });

  let event: {
    type?: string;
    created_at?: string;
    data?: { email_id?: string; tags?: Record<string, string> | { name: string; value: string }[] };
  };
  try {
    event = JSON.parse(body);
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  const tags = event.data?.tags;
  const tagMap = Array.isArray(tags)
    ? Object.fromEntries(tags.map((t) => [t.name, t.value]))
    : (tags ?? {});
  const reference = tagMap.inquiry_ref;
  const kind = tagMap.kind;
  if (
    !event.type ||
    !(event.type in RANK) ||
    !reference ||
    (kind !== "owner" && kind !== "customer")
  )
    return new Response("Ignored", { status: 202 });

  await updateInquiry(reference, (r) => {
    const delivery = r.emails?.[kind];
    if (!delivery) return;
    if (delivery.messageId && event.data?.email_id && delivery.messageId !== event.data.email_id)
      return;
    if ((RANK[`email.${delivery.event}`] ?? 0) >= RANK[event.type!]) return;
    delivery.event = event.type!.replace("email.", "");
    delivery.eventAt = event.created_at ?? new Date().toISOString();
  });
  return new Response("ok");
}
