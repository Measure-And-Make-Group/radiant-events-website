import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getInquiry } from "@/lib/inquiry-store";
import { INQUIRY_STATUSES, STATUS_LABELS } from "@/lib/inquiry-types";
import { deliveryLabel } from "../page";

export const dynamic = "force-dynamic";

const flashes: Record<string, string> = {
  "saved=status": "Status updated.",
  "saved=note": "Note saved.",
  "saved=email": "Email accepted by the provider.",
  "error=email": "The provider did not accept the email. Check the error below and try again.",
  "error=legacy": "This inquiry was saved before email delivery existed, so it is never emailed automatically.",
  "error=status": "That status is not valid.",
  "error=action": "That action is not valid.",
  "error=confirm": "Tick the confirmation box to delete this inquiry.",
};

export default async function InquiryDetail({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  if (!(await getAdminSession())) redirect("/admin/login");
  const { reference } = await params;
  const record = await getInquiry(reference);
  if (!record) notFound();
  const q = await searchParams;
  const flash = q.saved ? flashes[`saved=${q.saved}`] : q.error ? flashes[`error=${q.error}`] : null;
  const d = record.details;
  const rows: [string, string | undefined][] = [
    ["Name", d.name],
    ["Email", d.email],
    ["Phone", d.phone],
    ["Occasion", d.eventType],
    ["Date or season", d.eventDate],
    ["Location", d.venueOrCity],
    ["Guests", d.guestCount],
    ["Support", d.servicesOfInterest],
    ["Investment range", d.budget],
    ["Heard about Radiant via", d.referral],
    ["Vision", d.message],
  ];
  return (
    <section>
      <p className="mb-4 text-sm">
        <Link className="underline" href="/admin/inquiries">← All inquiries</Link>
      </p>
      <h1 className="font-display text-4xl mb-1">{d.name}</h1>
      <p className="mb-6 text-sm">
        Reference <strong>{record.reference}</strong> · received{" "}
        {new Date(record.receivedAt).toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "full", timeStyle: "short" })} ET
      </p>
      {flash && (
        <p role="status" className="mb-6 border border-current p-3 text-sm">{flash}</p>
      )}
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-2xl mb-3">Details</h2>
          <dl className="text-sm">
            {rows.filter(([, v]) => v).map(([label, value]) => (
              <div key={label} className="border-t border-current/20 py-2">
                <dt className="font-bold">{label}</dt>
                <dd className="whitespace-pre-wrap">
                  {label === "Email" ? (
                    <a className="underline" href={`mailto:${encodeURIComponent(value!).replace("%40", "@")}`}>{value}</a>
                  ) : value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl mb-3">Progress</h2>
            <form method="post" action={`/api/admin/inquiries/${record.reference}`} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="action" value="status" />
              <label className="text-sm" htmlFor="status">
                Status
                <select id="status" name="status" defaultValue={record.status} className="mt-1 block border border-current bg-transparent p-2">
                  {INQUIRY_STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </label>
              <button className="btn-primary" type="submit">Save status</button>
            </form>
            {record.statusHistory?.length > 0 && (
              <ol className="mt-3 text-xs">
                {record.statusHistory.map((h, i) => (
                  <li key={i}>
                    {STATUS_LABELS[h.status]} · {new Date(h.at).toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" })}
                  </li>
                ))}
              </ol>
            )}
          </div>
          <div>
            <h2 className="text-2xl mb-3">Private note</h2>
            <form method="post" action={`/api/admin/inquiries/${record.reference}`} className="space-y-3">
              <input type="hidden" name="action" value="note" />
              <label className="block text-sm" htmlFor="note">
                Visible only here
                <textarea id="note" name="note" rows={4} maxLength={2000} defaultValue={record.note ?? ""} className="mt-1 block w-full border border-current bg-transparent p-2" />
              </label>
              <button className="btn-primary" type="submit">Save note</button>
            </form>
          </div>
          <div>
            <h2 className="text-2xl mb-3">Email delivery</h2>
            <p className="mb-3 text-xs">
              Accepted means the email provider took the message. A delivered or bounced
              result appears only when the delivery webhook is connected.
            </p>
            {(["owner", "customer"] as const).map((k) => {
              const e = record.emails?.[k];
              return (
                <div key={k} className="mb-4 text-sm">
                  <p>
                    <strong>{k === "owner" ? "Studio notification" : "Client confirmation"}:</strong>{" "}
                    {deliveryLabel(e)}
                  </p>
                  {e?.messageId && <p className="text-xs">Message id {e.messageId}</p>}
                  {e?.lastAttemptAt && <p className="text-xs">Last attempt {new Date(e.lastAttemptAt).toUTCString()}</p>}
                  {e?.error && <p className="text-xs">Last error: {e.error}</p>}
                  {e && e.status !== "sent" && (
                    <form method="post" action={`/api/admin/inquiries/${record.reference}`} className="mt-2">
                      <input type="hidden" name="action" value="resend" />
                      <input type="hidden" name="which" value={k} />
                      <button className="text-link" type="submit">Resend this email</button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
          <div>
            <h2 className="text-2xl mb-3">Delete this inquiry</h2>
            <p className="mb-3 text-xs">
              Permanently removes the stored record, for example when a client asks for deletion
              or for a test entry. Emails already sent cannot be recalled.
            </p>
            <form method="post" action={`/api/admin/inquiries/${record.reference}`} className="space-y-3">
              <input type="hidden" name="action" value="delete" />
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" name="confirm" value="yes" />
                <span>I understand this cannot be undone.</span>
              </label>
              <button className="text-link" type="submit">Delete inquiry</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
