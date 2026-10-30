import { adminEmails, authConfigured, loginToken, sameOrigin } from "@/lib/auth";
import { emailConfig, sendEmail } from "@/lib/email";
import { escapeHtml } from "@/lib/inquiry-emails";
import { incrementCounter } from "@/lib/inquiry-store";
import { siteConfig } from "@/lib/site-config";

export const runtime = "nodejs";

const back = (request: Request, query: string) =>
  Response.redirect(new URL(`/admin/login?${query}`, request.url), 303);

/**
 * Passwordless sign-in: a one-time link is emailed to an address on the
 * allow-list. The response is identical whether or not the address is allowed.
 */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response("Forbidden", { status: 403 });
  if (!authConfigured() || !emailConfig()) return back(request, "error=config");
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const hour = new Date().toISOString().slice(0, 13).replace(/\D/g, "");
  let allowed = false;
  try {
    allowed = (await incrementCounter(`ratelimit/login-${hour}`)) <= 6;
  } catch {
    allowed = false;
  }
  if (allowed && email && adminEmails().includes(email)) {
    const token = loginToken(email);
    const link = `${siteConfig.url}/admin/verify?token=${encodeURIComponent(token)}`;
    await sendEmail({
      to: email,
      subject: "Your Radiant inquiry inbox sign-in link",
      text: `Use this link to sign in to the Radiant inquiry inbox. It works once and expires in 15 minutes.\n\n${link}\n\nIf you did not request it, you can ignore this email.`,
      html: `<p style="font-family:Arial,sans-serif;font-size:16px;line-height:1.6;">Use this link to sign in to the Radiant inquiry inbox. It works once and expires in 15 minutes.</p><p style="font-family:Arial,sans-serif;font-size:16px;"><a href="${escapeHtml(link)}">Sign in to the inquiry inbox</a></p><p style="font-family:Arial,sans-serif;font-size:14px;color:#4a4a42;">If you did not request it, you can ignore this email.</p>`,
      idempotencyKey: `admin-login/${token.slice(-24)}`,
    });
  }
  return back(request, "sent=1");
}
