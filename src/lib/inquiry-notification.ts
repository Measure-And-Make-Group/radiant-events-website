import type { InquiryFormValues } from "@/lib/inquiry-schema";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Emails the Radiant team the moment an inquiry is stored, via Resend.
 * Needs RESEND_API_KEY, INQUIRY_NOTIFICATION_EMAIL and INQUIRY_FROM_EMAIL;
 * without them it logs and does nothing. Never throws.
 */
export async function notifyNewInquiry(
  reference: string,
  inquiry: InquiryFormValues,
) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_NOTIFICATION_EMAIL;
  const from = process.env.INQUIRY_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    console.error("Inquiry notification not configured");
    return;
  }

  const rows: [string, string | undefined][] = [
    ["Name", inquiry.name],
    ["Email", inquiry.email],
    ["Phone", inquiry.phone],
    ["Event type", inquiry.eventType],
    ["Event date", inquiry.eventDate],
    ["Venue / city", inquiry.venueOrCity],
    ["Guest count", inquiry.guestCount],
    ["Services", inquiry.servicesOfInterest],
    ["Budget", inquiry.budget],
    ["Heard about us", inquiry.referral],
    ["Message", inquiry.message],
    ["Reference", reference],
  ];
  const visible = rows.filter(([, value]) => value);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: inquiry.email,
        subject: `New inquiry: ${inquiry.name} · ${inquiry.eventType}`,
        text: visible.map(([label, value]) => `${label}: ${value}`).join("\n"),
        html:
          "<h2>New event inquiry</h2><table cellpadding=\"6\">" +
          visible
            .map(
              ([label, value]) =>
                `<tr><td><strong>${label}</strong></td><td style="white-space:pre-wrap">${escapeHtml(value!)}</td></tr>`,
            )
            .join("") +
          "</table><p>Reply to this email to respond to the client.</p>",
      }),
    });
    if (!response.ok)
      console.error("Inquiry notification failed", response.status);
  } catch {
    console.error("Inquiry notification failed");
  }
}
