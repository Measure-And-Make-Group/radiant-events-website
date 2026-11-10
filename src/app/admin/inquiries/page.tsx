import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { listInquiries } from "@/lib/inquiry-store";
import {
  INQUIRY_STATUSES,
  STATUS_LABELS,
  type EmailDelivery,
  type InquiryStatus,
} from "@/lib/inquiry-types";

export const dynamic = "force-dynamic";

export function deliveryLabel(d: EmailDelivery | undefined) {
  if (!d) return "Not sent (saved before email delivery)";
  if (d.status === "sent")
    return d.event ? `Accepted, ${d.event}` : "Accepted by provider";
  if (d.status === "failed") return `Failed (${d.attempts} tries)`;
  return "Pending";
}

export default async function Inbox({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; deleted?: string }>;
}) {
  if (!(await getAdminSession())) redirect("/admin/login");
  const { status, deleted } = await searchParams;
  const filter = INQUIRY_STATUSES.includes(status as InquiryStatus)
    ? (status as InquiryStatus)
    : null;
  const all = await listInquiries();
  const records = filter ? all.filter((r) => r.status === filter) : all;
  const attention = all.filter(
    (r) =>
      r.emails &&
      (["owner", "customer"] as const).some((k) => r.emails[k].status !== "sent"),
  ).length;
  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <p className="eyebrow">Private</p>
          <h1 className="font-display text-4xl">Inquiries</h1>
        </div>
        <form method="post" action="/api/admin/logout">
          <button className="text-link" type="submit">
            Sign out
          </button>
        </form>
      </div>
      {deleted && (
        <p role="status" className="mb-4 border border-current p-3 text-sm">
          Inquiry deleted.
        </p>
      )}
      {attention > 0 && (
        <p role="status" className="mb-4 border border-current p-3 text-sm">
          {attention} inquir{attention === 1 ? "y has" : "ies have"} an email
          that has not been accepted by the provider. Open it to resend.
        </p>
      )}
      <nav aria-label="Filter by status" className="mb-6 flex flex-wrap gap-3 text-sm">
        <Link href="/admin/inquiries" aria-current={!filter ? "page" : undefined} className={!filter ? "font-bold underline" : "underline"}>
          All ({all.length})
        </Link>
        {INQUIRY_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/inquiries?status=${s}`}
            aria-current={filter === s ? "page" : undefined}
            className={filter === s ? "font-bold underline" : "underline"}
          >
            {STATUS_LABELS[s]} ({all.filter((r) => r.status === s).length})
          </Link>
        ))}
      </nav>
      {records.length === 0 ? (
        <p className="text-sm">No inquiries here yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-current">
                <th scope="col" className="py-2 pr-4">Reference</th>
                <th scope="col" className="py-2 pr-4">Name</th>
                <th scope="col" className="py-2 pr-4">Occasion</th>
                <th scope="col" className="py-2 pr-4">Received</th>
                <th scope="col" className="py-2 pr-4">Status</th>
                <th scope="col" className="py-2">Emails</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.reference} className="border-b border-current/20 align-top">
                  <td className="py-3 pr-4 whitespace-nowrap">
                    <Link className="underline" href={`/admin/inquiries/${r.reference}`}>
                      {r.reference}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">{r.details.name}</td>
                  <td className="py-3 pr-4">{r.details.eventType}</td>
                  <td className="py-3 pr-4 whitespace-nowrap">
                    {new Date(r.receivedAt).toLocaleString("en-US", {
                      timeZone: "America/New_York",
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="py-3 pr-4">{STATUS_LABELS[r.status] ?? r.status}</td>
                  <td className="py-3">
                    Owner: {deliveryLabel(r.emails?.owner)}
                    <br />
                    Client: {deliveryLabel(r.emails?.customer)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
