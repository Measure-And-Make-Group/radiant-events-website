import { get, list, put } from "@vercel/blob";
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import type { InquiryRecord } from "@/lib/inquiry-types";

/**
 * Private JSON storage. Production uses a private Vercel Blob store
 * (BLOB_READ_WRITE_TOKEN). Without a token outside production (local dev and
 * tests) it falls back to a local directory so the flow can be exercised.
 */
const blobEnabled = () =>
  !!process.env.BLOB_READ_WRITE_TOKEN || process.env.NODE_ENV === "production";
const localDir = () =>
  path.resolve(process.env.INQUIRY_LOCAL_STORE_DIR || ".inquiry-data");
const localPath = (name: string) => {
  const target = path.resolve(localDir(), name);
  if (!target.startsWith(localDir() + path.sep)) throw new Error("bad path");
  return target;
};

type Stored = { json: unknown; etag?: string };
class AlreadyExists extends Error {}
class Stale extends Error {}

async function readJson(name: string): Promise<Stored | null> {
  if (!blobEnabled()) {
    try {
      return { json: JSON.parse(await readFile(localPath(name), "utf8")) };
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw e;
    }
  }
  const result = await get(name, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200) return null;
  return {
    json: JSON.parse(await new Response(result.stream).text()),
    etag: result.blob.etag,
  };
}

async function writeJson(
  name: string,
  value: unknown,
  mode: { create: true } | { overwrite: true; ifMatch?: string },
) {
  const body = JSON.stringify(value);
  if (!blobEnabled()) {
    const file = localPath(name);
    await mkdir(path.dirname(file), { recursive: true });
    if ("create" in mode) {
      try {
        await writeFile(file, body, { flag: "wx" });
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code === "EEXIST")
          throw new AlreadyExists();
        throw e;
      }
    } else await writeFile(file, body);
    return;
  }
  try {
    await put(name, body, {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: "overwrite" in mode,
      ...("ifMatch" in mode && mode.ifMatch ? { ifMatch: mode.ifMatch } : {}),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    if (/precondition|etag/i.test(message) || (e as Error).name === "BlobPreconditionFailedError")
      throw new Stale();
    if (/already exists/i.test(message)) throw new AlreadyExists();
    throw e;
  }
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

export async function createInquiry(
  build: (reference: string) => InquiryRecord,
  key: string,
): Promise<{ record: InquiryRecord; duplicate: boolean }> {
  const now = new Date();
  for (let salt = 0; salt < 5; salt++) {
    const record = build(referenceFor(key, now, salt));
    try {
      await writeJson(recordName(record.reference), record, { create: true });
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

export async function getInquiry(reference: string) {
  if (!REFERENCE_PATTERN.test(reference)) return null;
  const stored = await readJson(recordName(reference));
  return stored ? normalizeRecord(stored.json) : null;
}

export async function listInquiries(): Promise<InquiryRecord[]> {
  const names = (await listNames("inquiries/")).filter((n) => n.endsWith(".json"));
  const records: InquiryRecord[] = [];
  for (let i = 0; i < names.length; i += 20) {
    const batch = await Promise.all(
      names.slice(i, i + 20).map(async (n) => {
        try {
          const stored = await readJson(n);
          return stored ? normalizeRecord(stored.json) : null;
        } catch {
          return null;
        }
      }),
    );
    for (const r of batch) if (r) records.push(r);
  }
  return records.sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}

/** Read-modify-write with optimistic concurrency (ETag) on Blob. */
export async function updateInquiry(
  reference: string,
  mutate: (record: InquiryRecord) => void,
): Promise<InquiryRecord | null> {
  if (!REFERENCE_PATTERN.test(reference)) return null;
  for (let attempt = 0; attempt < 4; attempt++) {
    const stored = await readJson(recordName(reference));
    const record = stored && (stored.json as InquiryRecord);
    if (!stored || !record || !(record as InquiryRecord).details) return null;
    mutate(record);
    try {
      await writeJson(recordName(reference), record, {
        overwrite: true,
        ifMatch: stored.etag,
      });
      return record;
    } catch (e) {
      if (!(e instanceof Stale)) throw e;
    }
  }
  throw new Error("Inquiry update conflict");
}

/** Small counters / markers (rate limits, one-time login links). */
export async function incrementCounter(name: string): Promise<number> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const stored = await readJson(name);
    const count = stored ? Number((stored.json as { n?: number }).n ?? 0) : 0;
    try {
      await writeJson(
        name,
        { n: count + 1, at: new Date().toISOString() },
        stored ? { overwrite: true, ifMatch: stored.etag } : { create: true },
      );
      return count + 1;
    } catch (e) {
      if (!(e instanceof Stale) && !(e instanceof AlreadyExists)) throw e;
    }
  }
  return Number.MAX_SAFE_INTEGER;
}

/** Returns true the first time a marker is created, false if it already existed. */
export async function claimMarker(name: string): Promise<boolean> {
  try {
    await writeJson(name, { at: new Date().toISOString() }, { create: true });
    return true;
  } catch (e) {
    if (e instanceof AlreadyExists) return false;
    throw e;
  }
}

/** Deletes counter/marker blobs older than maxAgeMs. Returns how many. */
export async function purgeOld(prefix: string, maxAgeMs: number) {
  const names = await listNames(prefix);
  let removed = 0;
  for (const name of names) {
    const stored = await readJson(name).catch(() => null);
    const at = stored && Date.parse((stored.json as { at?: string }).at ?? "");
    if (at && Date.now() - at > maxAgeMs) {
      if (blobEnabled()) {
        const { del } = await import("@vercel/blob");
        await del(name);
      } else await unlink(localPath(name)).catch(() => {});
      removed++;
    }
  }
  return removed;
}
