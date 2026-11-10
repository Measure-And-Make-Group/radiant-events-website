import { getAdminSession, sameOrigin } from "@/lib/auth";
import { deliverInquiryEmails } from "@/lib/inquiry-emails";
import { appendInquiryEvent, deleteInquiry, getInquiry } from "@/lib/inquiry-store";
import { INQUIRY_STATUSES, type InquiryStatus } from "@/lib/inquiry-types";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(
  request: Request,
  ctx: { params: Promise<{ reference: string }> },
) {
  if (!sameOrigin(request)) return new Response("Forbidden", { status: 403 });
  if (!(await getAdminSession()))
    return new Response("Unauthorized", { status: 401 });
  const { reference } = await ctx.params;
  const form = await request.formData();
  const action = String(form.get("action") ?? "");
  const detail = (flash: string) =>
    Response.redirect(
      new URL(`/admin/inquiries/${reference}?${flash}`, request.url),
      303,
    );

  const record = await getInquiry(reference);
  if (!record) return new Response("Not found", { status: 404 });

  if (action === "status") {
    const status = String(form.get("status")) as InquiryStatus;
    if (!INQUIRY_STATUSES.includes(status)) return detail("error=status");
    if (record.status !== status) {
      try {
        await appendInquiryEvent(reference, { type: "status", status, at: new Date().toISOString() });
      } catch {
        return detail("error=save");
      }
    }
    return detail("saved=status");
  }
  if (action === "note") {
    const note = String(form.get("note") ?? "").slice(0, 2000);
    try {
      await appendInquiryEvent(reference, { type: "note", note: note || undefined, at: new Date().toISOString() });
    } catch {
      return detail("error=save");
    }
    return detail("saved=note");
  }
  if (action === "resend") {
    // Legacy records (saved before email delivery existed) are never emailed.
    if (!record.emails) return detail("error=legacy");
    const which = String(form.get("which"));
    const only = which === "owner" || which === "customer" ? which : undefined;
    const updated = await deliverInquiryEmails(record, only);
    const failed = (["owner", "customer"] as const).some(
      (k) => (!only || only === k) && updated.emails[k].status !== "sent",
    );
    return detail(failed ? "error=email" : "saved=email");
  }
  if (action === "delete") {
    if (form.get("confirm") !== "yes") return detail("error=confirm");
    await deleteInquiry(reference);
    return Response.redirect(new URL("/admin/inquiries?deleted=1", request.url), 303);
  }
  return detail("error=action");
}
