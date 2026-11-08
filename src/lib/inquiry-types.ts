import type { InquiryDetails } from "@/lib/inquiry-schema";

export const INQUIRY_STATUSES = [
  "new",
  "contacted",
  "consultation_scheduled",
  "proposal_sent",
  "booked",
  "closed",
] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  consultation_scheduled: "Consultation scheduled",
  proposal_sent: "Proposal sent",
  booked: "Booked",
  closed: "Closed",
};

/**
 * "sent" means the email provider accepted the message and returned an id.
 * It does not mean the message reached an inbox; that is `event`, filled in
 * by the Resend webhook when it is configured.
 */
export type EmailDelivery = {
  status: "pending" | "sent" | "failed";
  attempts: number;
  messageId?: string;
  lastAttemptAt?: string;
  error?: string;
  event?: string;
  eventAt?: string;
};

/** Provider events, ranked so replays and out-of-order delivery are harmless. */
export const PROVIDER_EVENT_RANK: Record<string, number> = {
  "email.sent": 1,
  "email.delivery_delayed": 2,
  "email.delivered": 3,
  "email.complained": 4,
  "email.bounced": 4,
  "email.failed": 4,
};

/**
 * One change to an inquiry, stored as its own create-only object and replayed
 * in `at` order when the inquiry is read (see inquiry-store.ts).
 */
export type InquiryEvent =
  | { type: "status"; status: InquiryStatus; at: string }
  | { type: "note"; note?: string; at: string }
  | {
      type: "email-attempt";
      kind: "owner" | "customer";
      ok: boolean;
      messageId?: string;
      error?: string;
      at: string;
    }
  | {
      type: "provider-event";
      kind: "owner" | "customer";
      event: string;
      emailId?: string;
      at: string;
    }
  | { type: "reminder"; at: string };

export type InquiryRecord = {
  reference: string;
  receivedAt: string;
  status: InquiryStatus;
  statusHistory: { status: InquiryStatus; at: string }[];
  /** SHA-256 of the client submissionId; used to recognise a retried submit. */
  submissionKey?: string;
  consentAt: string;
  details: InquiryDetails;
  emails: { owner: EmailDelivery; customer: EmailDelivery };
  reminderSentAt?: string;
  note?: string;
};
