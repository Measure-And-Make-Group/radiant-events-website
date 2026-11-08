import { del, get, list, put } from "@vercel/blob";
import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, readdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import {
  PROVIDER_EVENT_RANK,
  type InquiryEvent,
  type InquiryRecord,
} from "@/lib/inquiry-types";

/**
 * Private JSON storage for inquiries.
 *
 * Production uses a private Vercel Blob store (BLOB_READ_WRITE_TOKEN). Without
 * a token outside production (local dev and tests) it falls back to a local
 * directory so the whole flow can be exercised.
 *
 * Concurrency model (2026-11): every object is written exactly once.
 *
 * Blob is object storage, not a database. Its conditional overwrite relies on
 * ETags, and the ETag that `get()` returns comes from the CDN response header,
 * which is not guaranteed to match the value the store compares on write. In
 * production that surfaced as repeated "Inquiry update conflict" errors, and
 * the old fallback then overwrote the record unconditionally, which could
 * silently discard a concurrent change (for example an inbox status update).
 *
 * So records are never rewritten. The submitted inquiry is stored once, and
 * every later change (status, note, email attempt, provider delivery event,
 * reminder) is its own uniquely named, create-only event object. Reading a
 * record replays its events in time order. Create-only writes cannot conflict
 * and cannot overwrite each other, so no ETag is ever needed.
 *
 * If volume ever outgrows this (thousands of inquiries), move the same event
 * model into a transactional database; callers would not change.
 */
const blobEnabled = () =>
  !!process.env.BLOB_READ_WRITE_TOKEN || process.env.NODE_ENV === "production";
const localDir = () =>
  path.resolve(process.env.INQUIRY_LOCAL_STORE_DIR || ".inquiry-data");
const localPath = (name: string) => {
  const target = path.resolve(/*turbopackIgnore: true*/ localDir(), name);
  if (!target.startsWith(localDir() + path.sep)) throw new Error("bad path");
  return target;
};

class AlreadyExists extends Error {}

async function readJson(name: string): Promise<unknown | null> {
  if (!blobEnabled()) {
    try {
      return JSON.parse(await readFile(localPath(name), "utf8"));
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw e;
    }
  }
  const result = await get(name, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200) return null;
  return JSON.parse(await new Response(result.stream).text());
}

/** Create-only write. Throws AlreadyExists if the name is taken. */
async function createJson(name: string, value: unknown) {
  const body = JSON.stringify(value);
  if (!blobEnabled()) {
    const file = localPath(name);
    await mkdir(path.dirname(file), { recursive: true });
    try {
      await writeFile(file, body, { flag: "wx" });
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "EEXIST") throw new AlreadyExists();
      throw e;
    }
    return;
  }
  try {
    await put(name, body, {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: false,
    });
  } catch (e) {
    if (/already exists/i.test(e instanceof Error ? e.message : ""))
      throw new AlreadyExists();
    throw e;
  }
}

async function removeNames(names: string[]) {
  if (!names.length) return;
  if (blobEnabled()) {
    for (let i = 0; i < names.length; i += 100) await del(names.slice(i, i + 100));
    return;
  }
  await Promise.all(names.map((n) => unlink(localPath(n)).catch(() => {})));
}

async function listNames(prefix: string): Promise<string[]> {
  if (!blobEnabled()) {
    const walk = async (dir: string): Promise<string[]> => {
      let entries;
      try {
        entries = await readdir(dir, { withFileTypes: true });
      } catch {
        return [];
      }
      const out: string[] = [];
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) out.push(...(await walk(full)));
        else out.push(path.relative(localDir(), full).split(path.sep).join("/"));
      }
      return out;
    };
    return (await walk(localDir())).filter((n) => n.startsWith(prefix));
  }
  const names: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    names.push(...page.blobs.map((b) => b.pathname));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return names;
}

async function readMany(names: string[]) {
  const out: { name: string; json: unknown }[] = [];
  for (let i = 0; i < names.length; i += 20) {
    const batch = await Promise.all(
      names.slice(i, i + 20).map(async (name) => ({
        name,
        json: await readJson(name).catch(() => null),
      })),
    );
    out.push(...batch.filter((b) => b.json !== null));
  }
  return out;
}

// ---- references --------------------------------------------------------------

export const submissionKeyOf = (submissionId: string) =>
  createHash("sha256").update(submissionId).digest("hex");

const ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";
export function referenceFor(key: string, now = new Date(), salt = 0) {
  const day = now.toISOString().slice(2, 10).replace(/-/g, "");
  const bytes = createHash("sha256").update(`${key}:${salt}`).digest();
  let code = "";
  for (let i = 0; i < 6; i++) code += ALPHABET[bytes[i] % ALPHABET.length];
  return `RE-${day}-${code}`;
}

export const REFERENCE_PATTERN = /^RE-\d{6}-[2-9A-HJKMNP-TV-Z]{6}$/;
const recordName = (reference: string) => `inquiries/${reference}.json`;
const eventPrefix = (reference: string) => `inquiry-events/${reference}/`;
export const deliveryMarker = (reference: string, kind: "owner" | "customer") =>
  `delivery/${reference}/${kind}.json`;
export const reminderMarker = (reference: string) =>
  `delivery-reminder/${reference}.json`;

// ---- records -------------------------------------------------------------------

export async function createInquiry(
  build: (reference: string) => InquiryRecord,
  key: string,
): Promise<{ record: InquiryRecord; duplicate: boolean }> {
  const now = new Date();
  for (let salt = 0; salt < 5; salt++) {
    const record = build(referenceFor(key, now, salt));
    try {
      await createJson(recordName(record.reference), record);
      return { record, duplicate: false };
    } catch (e) {
      if (!(e instanceof AlreadyExists)) throw e;
      const existing = await getInquiry(record.reference);
      if (existing && existing.submissionKey === key)
        return { record: existing, duplicate: true };
      // A different submission landed on the same reference: try another.
    }
  }
  throw new Error("Could not allocate a reference");
}

/** Records written before the email pipeline existed have no `emails` block. */
export function normalizeRecord(raw: unknown): InquiryRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.reference !== "string") return null;
  if (r.details) return raw as InquiryRecord;
  const { reference, receivedAt, status, ...rest } = r;
  return {
    reference,
    receivedAt: String(receivedAt ?? ""),
    status: (status as InquiryRecord["status"]) ?? "new",
    statusHistory: [],
    consentAt: String(receivedAt ?? ""),
    details: rest as unknown as InquiryRecord["details"],
    // No `emails` block marks a legacy record: it is never emailed or retried.
    emails: undefined as unknown as InquiryRecord["emails"],
  };
}

/**
 * Pure replay of events onto a stored record. Exported for tests.
 * `delivered` holds the email kinds that have an immutable delivery marker.
 */
export function applyEvents(
  base: InquiryRecord,
  events: InquiryEvent[],
  delivered: Set<"owner" | "customer"> = new Set(),
): InquiryRecord {
  const r: InquiryRecord = structuredClone(base);
  r.statusHistory = [...(r.statusHistory ?? [])];
  const sorted = [...events].sort((a, b) => a.at.localeCompare(b.at));
  for (const e of sorted) {
    switch (e.type) {
      case "status":
        if (r.status !== e.status) {
          r.status = e.status;
          r.statusHistory.push({ status: e.status, at: e.at });
        }
        break;
      case "note":
        r.note = e.note || undefined;
        break;
      case "email-attempt": {
        const d = r.emails?.[e.kind];
        if (!d || d.status === "sent") break;
        d.attempts += 1;
        d.lastAttemptAt = e.at;
        if (e.ok) {
          d.status = "sent";
          if (e.messageId) d.messageId = e.messageId;
          delete d.error;
        } else {
          d.status = "failed";
          d.error = e.error;
        }
        break;
      }
      case "provider-event": {
        const d = r.emails?.[e.kind];
        if (!d) break;
        if (d.messageId && e.emailId && d.messageId !== e.emailId) break;
        const current = PROVIDER_EVENT_RANK[`email.${d.event}`] ?? 0;
        const incoming = PROVIDER_EVENT_RANK[`email.${e.event}`] ?? 0;
        if (current >= incoming) break;
        d.event = e.event;
        d.eventAt = e.at;
        break;
      }
      case "reminder":
        r.reminderSentAt ??= e.at;
        break;
    }
  }
  if (r.emails) {
    for (const kind of delivered) {
      const d = r.emails[kind];
      if (d.status !== "sent") {
        d.status = "sent";
        delete d.error;
      }
    }
  }
  return r;
}

export async function getInquiry(reference: string) {
  if (!REFERENCE_PATTERN.test(reference)) return null;
  const base = normalizeRecord(await readJson(recordName(reference)));
  if (!base) return null;
  const [eventNames, delivered] = await Promise.all([
    listNames(eventPrefix(reference)),
    listNames(`delivery/${reference}/`),
  ]);
  const events = (await readMany(eventNames)).map((e) => e.json as InquiryEvent);
  const kinds = new Set(
    delivered
      .map((n) => n.slice(n.lastIndexOf("/") + 1).replace(".json", ""))
      .filter((k): k is "owner" | "customer" => k === "owner" || k === "customer"),
  );
  return applyEvents(base, events, kinds);
}

export async function listInquiries(): Promise<InquiryRecord[]> {
  const [recordNames, eventNames, deliveredNames] = await Promise.all([
    listNames("inquiries/"),
    listNames("inquiry-events/"),
    listNames("delivery/"),
  ]);
  const bases = (await readMany(recordNames.filter((n) => n.endsWith(".json"))))
    .map((b) => normalizeRecord(b.json))
    .filter((r): r is InquiryRecord => !!r);

  const events = new Map<string, InquiryEvent[]>();
  for (const { name, json } of await readMany(eventNames)) {
    const ref = name.split("/")[1];
    events.set(ref, [...(events.get(ref) ?? []), json as InquiryEvent]);
  }
  const delivered = new Map<string, Set<"owner" | "customer">>();
  for (const name of deliveredNames) {
    const [, ref, file] = name.split("/");
    const kind = file?.replace(".json", "");
    if (kind !== "owner" && kind !== "customer") continue;
    delivered.set(ref, (delivered.get(ref) ?? new Set()).add(kind));
  }
  return bases
    .map((b) => applyEvents(b, events.get(b.reference) ?? [], delivered.get(b.reference)))
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}

/**
 * Records one change to an inquiry as its own create-only object. Never
 * conflicts with another writer and never overwrites anything.
 */
export async function appendInquiryEvent(reference: string, event: InquiryEvent) {
  if (!REFERENCE_PATTERN.test(reference)) throw new Error("bad reference");
  const stamp = event.at.replace(/[:.]/g, "-");
  const name = `${eventPrefix(reference)}${stamp}-${randomBytes(5).toString("hex")}.json`;
  await createJson(name, event);
}

export async function deleteInquiry(reference: string) {
  if (!REFERENCE_PATTERN.test(reference)) return false;
  const related = await Promise.all([
    listNames(eventPrefix(reference)),
    listNames(`delivery/${reference}/`),
  ]);
  await removeNames([
    recordName(reference),
    reminderMarker(reference),
    ...related.flat(),
  ]);
  return true;
}

// ---- markers and rate limits -----------------------------------------------------

/** True if a create-only marker exists. */
export async function hasMarker(name: string): Promise<boolean> {
  return (await readJson(name)) !== null;
}

/** Returns true the first time a marker is created, false if it already existed. */
export async function claimMarker(name: string): Promise<boolean> {
  try {
    await createJson(name, { at: new Date().toISOString() });
    return true;
  } catch (e) {
    if (e instanceof AlreadyExists) return false;
    throw e;
  }
}

/** Releases a marker that was claimed for work that then did not happen. */
export async function releaseMarker(name: string) {
  await removeNames([name]);
}

/**
 * Fixed-window rate limit using create-only slots: `limit` slots exist per
 * window and each allowed action claims one. No counter is ever rewritten.
 */
export async function takeRateSlot(window: string, limit: number): Promise<boolean> {
  const prefix = `ratelimit/${window}/`;
  const used = (await listNames(prefix)).length;
  for (let slot = used + 1; slot <= limit; slot++) {
    if (await claimMarker(`${prefix}${slot}.json`)) return true;
  }
  return false;
}

/** Deletes counter/marker blobs older than maxAgeMs. Returns how many. */
export async function purgeOld(prefix: string, maxAgeMs: number) {
  const names = await listNames(prefix);
  const expired: string[] = [];
  for (const { name, json } of await readMany(names)) {
    const at = Date.parse((json as { at?: string }).at ?? "");
    if (at && Date.now() - at > maxAgeMs) expired.push(name);
  }
  await removeNames(expired);
  return expired.length;
}
