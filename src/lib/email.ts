/** Thin Resend client. Never logs addresses, bodies or keys. */
export type SendResult =
  | { ok: true; id: string }
  | { ok: false; error: string; retryable: boolean };

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  idempotencyKey: string;
  tags?: { name: string; value: string }[];
};

export function emailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.INQUIRY_FROM_EMAIL;
  const ownerTo = process.env.INQUIRY_NOTIFICATION_EMAIL;
  if (!apiKey || !from || !ownerTo) return null;
  return {
    apiKey,
    from,
    ownerTo,
    replyTo: process.env.INQUIRY_REPLY_TO || ownerTo,
  };
}

const apiBase = () =>
  (process.env.NODE_ENV !== "production" && process.env.RESEND_API_URL) ||
  "https://api.resend.com";

export async function sendEmail(message: EmailMessage): Promise<SendResult> {
  const config = emailConfig();
  if (!config)
    return { ok: false, error: "Email is not configured", retryable: true };
  try {
    const response = await fetch(`${apiBase()}/emails`, {
      method: "POST",
      signal: AbortSignal.timeout(9000),
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": message.idempotencyKey,
      },
      body: JSON.stringify({
        from: config.from,
        to: [message.to],
        reply_to: message.replyTo,
        subject: message.subject.replace(/[\r\n]+/g, " ").slice(0, 200),
        html: message.html,
        text: message.text,
        tags: message.tags,
      }),
    });
    const raw = await response.text();
    let body: { id?: string; message?: string; name?: string } = {};
    try {
      body = JSON.parse(raw);
    } catch {
      body = { message: raw };
    }
    if (response.ok && body.id) return { ok: true, id: body.id };
    return {
      ok: false,
      error: `Resend ${response.status}${body.name ? ` ${body.name}` : ""}${
        body.message
          ? `: ${String(body.message).replace(/\S+@\S+/g, "[email]").slice(0, 160)}`
          : ""
      }`.slice(0, 240),
      // 4xx other than rate limiting / idempotency races will not fix themselves.
      retryable:
        response.status >= 500 ||
        response.status === 429 ||
        response.status === 409 ||
        response.status === 401 ||
        response.status === 403,
    };
  } catch {
    return { ok: false, error: "Network error or timeout", retryable: true };
  }
}
