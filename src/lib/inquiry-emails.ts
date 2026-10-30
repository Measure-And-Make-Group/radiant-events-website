import { emailConfig, sendEmail } from "@/lib/email";
import { updateInquiry } from "@/lib/inquiry-store";
import { STATUS_LABELS, type InquiryRecord } from "@/lib/inquiry-types";
import { siteConfig } from "@/lib/site-config";

const OLIVE = "#59664a";
const INK = "#2b2b26";
const IVORY = "#f8f6ee";

export const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const oneLine = (value: string) => value.replace(/[\r\n]+/g, " ").trim();

function summaryRows(record: InquiryRecord, includeContact: boolean) {
  const d = record.details;
  const rows: [string, string | undefined][] = [
    ...(includeContact
      ? ([
          ["Name", d.name],
          ["Email", d.email],
          ["Phone", d.phone],
        ] as [string, string | undefined][])
      : []),
    ["Occasion", d.eventType],
    ["Date or season", d.eventDate || "To be discussed"],
    ["Location", d.venueOrCity],
    ["Guests", d.guestCount || "To be discussed"],
    ["Support", d.servicesOfInterest],
    ["Investment range", d.budget],
    ["Vision", d.message],
    ...(includeContact
      ? ([["Heard about Radiant via", d.referral]] as [string, string | undefined][])
      : []),
  ];
  return rows.filter(([, v]) => v);
}

function shell(title: string, intro: string, body: string, footer: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:${IVORY};color:${INK};font-family:Georgia,'Times New Roman',serif;">
<div style="max-width:620px;margin:0 auto;padding:32px 20px;">
<p style="margin:0 0 24px;font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:${OLIVE};font-family:Arial,Helvetica,sans-serif;">Radiant Events Planning</p>
<h1 style="margin:0 0 16px;font-size:28px;line-height:1.25;font-weight:normal;color:#35412e;">${escapeHtml(title)}</h1>
<p style="margin:0 0 24px;font-size:17px;line-height:1.6;">${intro}</p>
${body}
<p style="margin:32px 0 0;font-size:14px;line-height:1.6;color:#4a4a42;font-family:Arial,Helvetica,sans-serif;">${footer}</p>
</div></body></html>`;
}

function table(rows: [string, string | undefined][]) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;">${rows
    .map(
      ([label, value]) =>
        `<tr><th scope="row" align="left" valign="top" style="padding:10px 12px 10px 0;width:38%;border-top:1px solid #d9d2c3;color:${OLIVE};font-weight:bold;">${escapeHtml(label)}</th><td valign="top" style="padding:10px 0;border-top:1px solid #d9d2c3;white-space:pre-wrap;">${escapeHtml(value!)}</td></tr>`,
    )
    .join("")}</table>`;
}

export function ownerEmail(record: InquiryRecord) {
  const d = record.details;
  const rows = summaryRows(record, true);
  const meta: [string, string][] = [
    ["Reference", record.reference],
    ["Received", new Date(record.receivedAt).toUTCString()],
  ];
  const text = [
    `New inquiry ${record.reference}`,
    "",
    ...[...meta, ...rows].map(([l, v]) => `${l}: ${v}`),
    "",
    "Reply to this email to respond to the client. Status and delivery details are in the private inquiry inbox.",
  ].join("\n");
  const html = shell(
    "New event inquiry",
    `Reference <strong>${escapeHtml(record.reference)}</strong>`,
    table([...meta, ...rows]),
    `Reply to this email to respond to ${escapeHtml(oneLine(d.name))} directly. Manage this inquiry in the private inbox at ${escapeHtml(siteConfig.url)}/admin/inquiries.`,
  );
  return {
    subject: `New inquiry ${record.reference}: ${oneLine(d.name)} · ${d.eventType}`,
    html,
    text,
  };
}

export const RESPONSE_WINDOW = "within 12 to 24 hours";

export function customerEmail(record: InquiryRecord) {
  const d = record.details;
  const first = oneLine(d.name).split(" ")[0];
  const rows = summaryRows(record, false);
  const text = [
    `Hello ${first},`,
    "",
    "Thank you for reaching out to Radiant Events Planning. We have received your inquiry and look forward to learning more about your celebration.",
    "",
    `Your reference: ${record.reference}`,
    "",
    "What you shared:",
    ...rows.map(([l, v]) => `- ${l}: ${v}`),
    "",
    "What happens next",
    `Rickya will review your details and reply personally, usually ${RESPONSE_WINDOW}. If it feels like a fit, we will talk through availability, scope, and your custom proposal.`,
    "",
    "Please note: sending an inquiry does not reserve your event date. Your date is held once your proposal and booking steps are confirmed.",
    "",
    "If you would like to add anything, simply reply to this email and mention your reference.",
    "",
    "Planning with purpose, serving with grace.",
    "Radiant Events Planning · Metro Atlanta, Georgia",
  ].join("\n");
  const html = shell(
    `Thank you, ${escapeHtml(first)}.`,
    "We have received your inquiry and look forward to learning more about your celebration.",
    `<p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;">Your reference: <strong>${escapeHtml(record.reference)}</strong></p>
<h2 style="margin:0 0 8px;font-size:20px;font-weight:normal;color:#35412e;">What you shared</h2>
${table(rows)}
<h2 style="margin:28px 0 8px;font-size:20px;font-weight:normal;color:#35412e;">What happens next</h2>
<p style="margin:0 0 12px;font-size:16px;line-height:1.6;">Rickya will review your details and reply personally, usually ${RESPONSE_WINDOW}. If it feels like a fit, we will talk through availability, scope, and your custom proposal.</p>
<p style="margin:0;font-size:16px;line-height:1.6;"><strong>Please note:</strong> sending an inquiry does not reserve your event date. Your date is held once your proposal and booking steps are confirmed.</p>`,
    "To add anything, simply reply to this email and mention your reference.<br><em>Planning with purpose, serving with grace.</em><br>Radiant Events Planning &middot; Metro Atlanta, Georgia",
  );
  return { subject: `We received your inquiry (${record.reference})`, html, text };
}

const MAX_ATTEMPTS = 5;

/**
 * Sends whichever of the two transactional emails is not yet accepted by the
 * provider, then records the outcome. Idempotency keys make a repeated call
 * safe: Resend returns the original message instead of sending a second one.
 */
export async function deliverInquiryEmails(
  record: InquiryRecord,
  only?: "owner" | "customer",
) {
  const config = emailConfig();
  const targets = (["owner", "customer"] as const).filter(
    (k) => (!only || only === k) && record.emails?.[k].status !== "sent",
  );
  const results = await Promise.all(
    targets.map(async (kind) => {
      if (!config)
        return [kind, { ok: false, error: "Email is not configured", retryable: true } as const] as const;
      const built = kind === "owner" ? ownerEmail(record) : customerEmail(record);
      const result = await sendEmail({
        ...built,
        to: kind === "owner" ? config.ownerTo : record.details.email,
        replyTo: kind === "owner" ? record.details.email : config.replyTo,
        idempotencyKey: `inquiry/${record.reference}/${kind}`,
        tags: [
          { name: "inquiry_ref", value: record.reference },
          { name: "kind", value: kind },
        ],
      });
      return [kind, result] as const;
    }),
  );
  if (!results.length) return record;
  const now = new Date().toISOString();
  const updated = await updateInquiry(record.reference, (r) => {
    for (const [kind, result] of results) {
      const d = r.emails[kind];
      d.attempts += 1;
      d.lastAttemptAt = now;
      if (result.ok) {
        d.status = "sent";
        d.messageId = result.id;
        delete d.error;
      } else {
        d.status = "failed";
        d.error = result.error;
        // Provider status only: no addresses, names or message content.
        console.error(`Inquiry email not accepted (${kind}): ${result.error}`);
      }
    }
  });
  return updated ?? record;
}

export const needsEmailRetry = (r: InquiryRecord, olderThanMs = 0) =>
  !!r.emails &&
  (["owner", "customer"] as const).some((k) => {
    const d = r.emails[k];
    return (
      d.status !== "sent" &&
      d.attempts < MAX_ATTEMPTS &&
      Date.now() - Date.parse(d.lastAttemptAt ?? r.receivedAt) >= olderThanMs
    );
  });

export function reminderEmail(records: InquiryRecord[]) {
  const lines = records.map(
    (r) =>
      `${r.reference} · ${oneLine(r.details.name)} · ${r.details.eventType} · received ${new Date(r.receivedAt).toUTCString()} · ${STATUS_LABELS[r.status]}`,
  );
  const link = `${siteConfig.url}/admin/inquiries`;
  return {
    subject: `Reminder: ${records.length} inquiry${records.length === 1 ? "" : "s"} still marked New`,
    text: `These inquiries have been marked New for more than 12 hours:\n\n${lines.join("\n")}\n\nOpen the inbox: ${link}`,
    html: shell(
      "Inquiries awaiting a reply",
      "These inquiries have been marked New for more than 12 hours.",
      `<ul style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;padding-left:20px;">${lines
        .map((l) => `<li>${escapeHtml(l)}</li>`)
        .join("")}</ul>`,
      `Open the inbox: <a href="${escapeHtml(link)}" style="color:${OLIVE};">${escapeHtml(link)}</a>`,
    ),
  };
}
