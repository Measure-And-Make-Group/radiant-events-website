// End-to-end checks for the inquiry pipeline against a local `next dev`
// server, a mock Resend API and a local store. No real email is sent.
// Run: npm run test:inquiry
import { spawn } from "node:child_process";
import { createHmac, randomUUID } from "node:crypto";
import http from "node:http";
import { mkdtemp, writeFile, readdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import assert from "node:assert/strict";

const results = [];
const check = async (name, fn) => {
  try {
    await fn();
    results.push(["PASS", name]);
    console.log("PASS", name);
  } catch (e) {
    results.push(["FAIL", name]);
    console.log("FAIL", name, "\n   ", e.message);
  }
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- mock Resend -----------------------------------------------------------
const sent = [];
const seenKeys = new Map();
let mockMode = "ok";
const mock = http.createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    if (mockMode === "fail") {
      res.writeHead(500, { "content-type": "application/json" });
      return res.end(JSON.stringify({ name: "application_error", message: "boom" }));
    }
    const key = req.headers["idempotency-key"];
    if (seenKeys.has(key)) {
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify({ id: seenKeys.get(key) }));
    }
    const id = randomUUID();
    seenKeys.set(key, id);
    sent.push({ ...JSON.parse(body), id, key, auth: req.headers.authorization });
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ id }));
  });
});
await new Promise((r) => mock.listen(0, "127.0.0.1", r));
const mockUrl = `http://127.0.0.1:${mock.address().port}`;

// ---- servers ---------------------------------------------------------------
const dataDir = await mkdtemp(path.join(tmpdir(), "radiant-inq-"));
const badFile = path.join(dataDir, "not-a-dir");
await writeFile(badFile, "x");
const env = (port, store) => ({
  ...process.env,
  PORT: String(port),
  NODE_ENV: "development",
  BLOB_READ_WRITE_TOKEN: "",
  RESEND_API_KEY: "re_test_key",
  RESEND_API_URL: mockUrl,
  INQUIRY_FROM_EMAIL: "Radiant Events Planning <info@example.test>",
  INQUIRY_NOTIFICATION_EMAIL: "owner@example.test",
  INQUIRY_FORM_SECRET: "test-secret-test-secret-test-secret",
  CRON_SECRET: "cron-test-secret",
  RESEND_WEBHOOK_SECRET: "whsec_" + Buffer.from("webhook-test-secret").toString("base64"),
  INQUIRY_LOCAL_STORE_DIR: store,
});
const start = (port, store) => {
  const child = spawn("npx", ["next", "dev", "-p", String(port)], {
    env: env(port, store),
    stdio: "ignore",
    detached: true,
  });
  return child;
};
const stop = (child) => { try { process.kill(-child.pid, "SIGTERM"); } catch {} };
const A = 3211, B = 3212;
const servers = [start(A, dataDir)];
const base = (p) => `http://127.0.0.1:${p}`;
const waitUp = async (p) => {
  for (let i = 0; i < 90; i++) {
    try { if ((await fetch(base(p) + "/api/inquiries/token")).ok) break; } catch {}
    await sleep(1000);
  }
};
await waitUp(A);

// ---- helpers ---------------------------------------------------------------
const valid = () => ({
  name: "Test Client",
  email: "client@example.test",
  phone: "",
  eventType: "Wedding",
  eventDate: "Spring 2027",
  venueOrCity: "Atlanta",
  guestCount: "51–100",
  servicesOfInterest: "Design + Room Styling",
  budget: "$1,000 – $2,500",
  message: "A garden-style celebration <b>test</b> with balloons.",
  referral: "Instagram",
  consent: true,
  company: "",
});
const token = async (p, wait = true) => {
  const { token } = await (await fetch(base(p) + "/api/inquiries/token")).json();
  if (wait) await sleep(4300);
  return token;
};
const post = (p, body, extra = {}) =>
  fetch(base(p) + "/api/inquiries", {
    method: "POST",
    headers: { "content-type": "application/json", origin: base(p), ...extra },
    body: JSON.stringify(body),
  });
const files = async () => (await readdir(path.join(dataDir, "inquiries")).catch(() => [])).sort();
let ref, firstId;

// ---- tests -----------------------------------------------------------------
await check("1 valid inquiry is stored and both emails are sent", async () => {
  firstId = randomUUID();
  const res = await post(A, { ...valid(), submissionId: firstId, token: await token(A) });
  assert.equal(res.status, 201);
  const body = await res.json();
  ref = body.reference;
  assert.match(ref, /^RE-\d{6}-[A-Z0-9]{6}$/);
  assert.equal(body.confirmationEmail, "sent");
  assert.deepEqual(await files(), [`${ref}.json`]);
  const owner = sent.find((m) => m.key === `inquiry/${ref}/owner`);
  const cust = sent.find((m) => m.key === `inquiry/${ref}/customer`);
  assert.deepEqual(owner.to, ["owner@example.test"]);
  assert.equal(owner.reply_to, "client@example.test");
  assert.ok(owner.subject.includes(ref));
  assert.ok(owner.html.includes("&lt;b&gt;test&lt;/b&gt;"), "html is escaped");
  assert.ok(!owner.html.includes("<b>test</b>"));
  assert.deepEqual(cust.to, ["client@example.test"]);
  assert.equal(cust.reply_to, "owner@example.test");
  assert.ok(cust.text.includes(ref) && /does not reserve/.test(cust.text));
  assert.ok(owner.tags.some((t) => t.name === "inquiry_ref" && t.value === ref));
  assert.ok(!JSON.stringify(sent).includes("blob.vercel"), "no storage urls in email");
  const record = JSON.parse(await readFile(path.join(dataDir, "inquiries", `${ref}.json`), "utf8"));
  assert.equal(record.emails.owner.status, "sent");
  assert.ok(record.emails.owner.messageId && record.emails.customer.messageId);
  assert.equal(record.status, "new");
  assert.equal(record.company, undefined);
});

await check("2 invalid / missing fields rejected server-side", async () => {
  const res = await post(A, { ...valid(), email: "nope", name: "", submissionId: randomUUID(), token: await token(A, false) });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.ok(body.fields.email && body.fields.name);
  const bad = await post(A, { ...valid(), budget: "free", submissionId: randomUUID(), token: await token(A, false) });
  assert.equal(bad.status, 400);
});

await check("3 missing consent rejected", async () => {
  const res = await post(A, { ...valid(), consent: false, submissionId: randomUUID(), token: await token(A, false) });
  assert.equal(res.status, 400);
  assert.ok((await res.json()).fields.consent);
});

await check("4 honeypot: fake success, nothing stored or emailed", async () => {
  const before = (await files()).length, mails = sent.length;
  const res = await post(A, { ...valid(), company: "Acme", submissionId: randomUUID(), token: await token(A, false) });
  assert.equal(res.status, 201);
  assert.equal((await files()).length, before);
  assert.equal(sent.length, mails);
});

await check("4b missing token, too-fast submit, wrong origin, bad content-type", async () => {
  assert.equal((await post(A, { ...valid(), submissionId: randomUUID() })).status, 400);
  const fast = await post(A, { ...valid(), submissionId: randomUUID(), token: await token(A, false) });
  assert.equal(fast.status, 429);
  const o = await post(A, { ...valid(), submissionId: randomUUID(), token: "x" }, { origin: "https://evil.example" });
  assert.equal(o.status, 403);
  const c = await fetch(base(A) + "/api/inquiries", { method: "POST", headers: { origin: base(A), "content-type": "text/plain" }, body: "x" });
  assert.equal(c.status, 415);
});

await check("5 duplicate submission: same reference, no new storage or email", async () => {
  const mails = sent.length;
  const res = await post(A, { ...valid(), submissionId: firstId, token: await token(A) });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.duplicate, true);
  assert.equal(body.reference, ref);
  assert.equal((await files()).length, 1);
  assert.equal(sent.length, mails);
});

let failRef;
await check("7 email failure after storage keeps the inquiry; cron recovers it without duplicates", async () => {
  mockMode = "fail";
  const res = await post(A, { ...valid(), email: "second@example.test", submissionId: randomUUID(), token: await token(A) });
  assert.equal(res.status, 201);
  const body = await res.json();
  failRef = body.reference;
  assert.equal(body.confirmationEmail, "pending");
  const rec = () => readFile(path.join(dataDir, "inquiries", `${failRef}.json`), "utf8").then(JSON.parse);
  let r = await rec();
  assert.equal(r.emails.owner.status, "failed");
  assert.equal(r.emails.customer.status, "failed");
  mockMode = "ok";
  // Cron ignores records whose last attempt was under 10 minutes ago; age it.
  r.emails.owner.lastAttemptAt = r.emails.customer.lastAttemptAt = "2020-01-01T00:00:00Z";
  await writeFile(path.join(dataDir, "inquiries", `${failRef}.json`), JSON.stringify(r));
  const noAuth = await fetch(base(A) + "/api/cron/inquiries");
  assert.equal(noAuth.status, 401);
  const cron = await fetch(base(A) + "/api/cron/inquiries", { headers: { authorization: "Bearer cron-test-secret" } });
  assert.equal(cron.status, 200);
  r = await rec();
  assert.equal(r.emails.owner.status, "sent");
  assert.equal(r.emails.customer.status, "sent");
  assert.equal(sent.filter((m) => m.key.startsWith(`inquiry/${failRef}/`)).length, 2);
  const again = await fetch(base(A) + "/api/cron/inquiries", { headers: { authorization: "Bearer cron-test-secret" } });
  assert.equal((await again.json()).retried, 0);
});

await check("7b untouched legacy records are never emailed", async () => {
  await writeFile(path.join(dataDir, "inquiries", "legacy.json"), JSON.stringify({ reference: "x", receivedAt: "2020-01-01T00:00:00Z", status: "new", name: "Old Lead", email: "old@example.test", message: "old" }));
  const mails = sent.length;
  await fetch(base(A) + "/api/cron/inquiries", { headers: { authorization: "Bearer cron-test-secret" } });
  assert.equal(sent.length, mails);
});

await check("7c reminder: inquiry still New after 12h gets one internal reminder", async () => {
  const f = path.join(dataDir, "inquiries", `${ref}.json`);
  const r = JSON.parse(await readFile(f, "utf8"));
  r.receivedAt = new Date(Date.now() - 13 * 3600_000).toISOString();
  await writeFile(f, JSON.stringify(r));
  const run = () => fetch(base(A) + "/api/cron/inquiries", { headers: { authorization: "Bearer cron-test-secret" } }).then((x) => x.json());
  const first = await run();
  assert.ok(first.reminded >= 1);
  const rem = sent.filter((m) => m.subject.startsWith("Reminder"));
  assert.equal(rem.length, 1);
  assert.deepEqual(rem[0].to, ["owner@example.test"]);
  assert.equal((await run()).reminded, 0);
});

await check("8 inbox and admin APIs are protected", async () => {
  const page = await fetch(base(A) + "/admin/inquiries", { redirect: "manual" });
  assert.ok([307, 308].includes(page.status));
  assert.ok(page.headers.get("location").includes("/admin/login"));
  const detail = await fetch(base(A) + `/admin/inquiries/${ref}`, { redirect: "manual" });
  assert.ok([307, 308].includes(detail.status));
  const act = await fetch(base(A) + `/api/admin/inquiries/${ref}`, { method: "POST", headers: { origin: base(A) }, body: new URLSearchParams({ action: "status", status: "closed" }) });
  assert.equal(act.status, 401);
  const csrf = await fetch(base(A) + `/api/admin/inquiries/${ref}`, { method: "POST", headers: { origin: "https://evil.example" }, body: new URLSearchParams({ action: "status", status: "closed" }) });
  assert.equal(csrf.status, 403);
  const forged = await fetch(base(A) + "/admin/inquiries", { redirect: "manual", headers: { cookie: "radiant_admin=eyJlbWFpbCI6Im93bmVyQGV4YW1wbGUudGVzdCIsImV4cCI6OTk5OTk5OTk5OTk5OX0.AAAA" } });
  assert.ok([307, 308].includes(forged.status));
});

let cookie;
await check("8b magic-link sign-in, single use, allow-list only", async () => {
  const mails = sent.length;
  await fetch(base(A) + "/api/admin/login", { method: "POST", redirect: "manual", headers: { origin: base(A) }, body: new URLSearchParams({ email: "stranger@example.test" }) });
  assert.equal(sent.length, mails, "no link for non-allow-listed address");
  const r = await fetch(base(A) + "/api/admin/login", { method: "POST", redirect: "manual", headers: { origin: base(A) }, body: new URLSearchParams({ email: "Owner@Example.test" }) });
  assert.equal(r.status, 303);
  const mail = sent.at(-1);
  assert.deepEqual(mail.to, ["owner@example.test"]);
  const link = mail.text.match(/https?:\/\/\S+token=[^\s]+/)[0];
  const tok = decodeURIComponent(new URL(link).searchParams.get("token"));
  const verifyPage = await (await fetch(`${base(A)}/admin/verify?token=${encodeURIComponent(tok)}`)).text();
  assert.ok(verifyPage.includes('action="/api/admin/session"'));
  const s = await fetch(base(A) + "/api/admin/session", { method: "POST", redirect: "manual", headers: { origin: base(A) }, body: new URLSearchParams({ token: tok }) });
  assert.equal(s.status, 303);
  assert.ok(s.headers.get("location").endsWith("/admin/inquiries"));
  const set = s.headers.get("set-cookie");
  assert.ok(/HttpOnly/i.test(set) && /SameSite=strict/i.test(set));
  cookie = set.split(";")[0];
  const reuse = await fetch(base(A) + "/api/admin/session", { method: "POST", redirect: "manual", headers: { origin: base(A) }, body: new URLSearchParams({ token: tok }) });
  assert.ok(reuse.headers.get("location").includes("error=link"));
});

await check("8c signed-in owner sees inquiry, updates status, notes, resends", async () => {
  const list = await (await fetch(base(A) + "/admin/inquiries", { headers: { cookie } })).text();
  assert.ok(list.includes(ref) && list.includes("Test Client"));
  assert.ok(list.includes("Accepted by provider"));
  const detail = await (await fetch(base(A) + `/admin/inquiries/${ref}`, { headers: { cookie } })).text();
  assert.ok(detail.includes("garden-style") && detail.includes("&lt;b&gt;test&lt;/b&gt;"));
  const up = await fetch(base(A) + `/api/admin/inquiries/${ref}`, { method: "POST", redirect: "manual", headers: { origin: base(A), cookie }, body: new URLSearchParams({ action: "status", status: "consultation_scheduled" }) });
  assert.equal(up.status, 303);
  const r = JSON.parse(await readFile(path.join(dataDir, "inquiries", `${ref}.json`), "utf8"));
  assert.equal(r.status, "consultation_scheduled");
  assert.equal(r.statusHistory.at(-1).status, "consultation_scheduled");
  await fetch(base(A) + `/api/admin/inquiries/${ref}`, { method: "POST", redirect: "manual", headers: { origin: base(A), cookie }, body: new URLSearchParams({ action: "note", note: "Call booked Friday" }) });
  const mails = sent.length;
  await fetch(base(A) + `/api/admin/inquiries/${ref}`, { method: "POST", redirect: "manual", headers: { origin: base(A), cookie }, body: new URLSearchParams({ action: "resend", which: "customer" }) });
  assert.equal(sent.length, mails, "already-sent email is not sent twice");
  const bad = await fetch(base(A) + `/api/admin/inquiries/${ref}`, { method: "POST", redirect: "manual", headers: { origin: base(A), cookie }, body: new URLSearchParams({ action: "status", status: "hacked" }) });
  assert.ok(bad.headers.get("location").includes("error=status"));
});

await check("8d delete needs confirmation, then removes the record", async () => {
  const url = base(A) + `/api/admin/inquiries/${failRef}`;
  const h = { origin: base(A), cookie };
  const no = await fetch(url, { method: "POST", redirect: "manual", headers: h, body: new URLSearchParams({ action: "delete" }) });
  assert.ok(no.headers.get("location").includes("error=confirm"));
  assert.ok((await files()).includes(`${failRef}.json`));
  const yes = await fetch(url, { method: "POST", redirect: "manual", headers: h, body: new URLSearchParams({ action: "delete", confirm: "yes" }) });
  assert.equal(yes.status, 303);
  assert.ok(!(await files()).includes(`${failRef}.json`));
});

await check("webhook: rejects bad signature, records delivery, tolerates replay/out-of-order", async () => {
  const secret = Buffer.from("webhook-test-secret");
  const send = (type, ts = Math.floor(Date.now() / 1000), badSig = false) => {
    const body = JSON.stringify({ type, created_at: new Date().toISOString(), data: { email_id: JSON.parse("{}").x, tags: { inquiry_ref: ref, kind: "customer" } } });
    const id = "msg_" + randomUUID();
    const sig = createHmac("sha256", secret).update(`${id}.${ts}.${body}`).digest("base64");
    return fetch(base(A) + "/api/webhooks/resend", { method: "POST", headers: { "svix-id": id, "svix-timestamp": String(ts), "svix-signature": `v1,${badSig ? "AAAA" : sig}` }, body });
  };
  assert.equal((await send("email.delivered", undefined, true)).status, 401);
  assert.equal((await send("email.delivered", 1000)).status, 401);
  assert.equal((await send("email.delivered")).status, 200);
  assert.equal((await send("email.delivered")).status, 200);
  assert.equal((await send("email.sent")).status, 200);
  const r = JSON.parse(await readFile(path.join(dataDir, "inquiries", `${ref}.json`), "utf8"));
  assert.equal(r.emails.customer.event, "delivered");
});

await check("rate limit: more than 8 accepted submissions per hour per client is refused", async () => {
  let limited = false;
  const shared = await token(A);
  for (let i = 0; i < 12 && !limited; i++) {
    const res = await post(A, { ...valid(), submissionId: randomUUID(), token: shared });
    if (res.status === 429 && (await res.json()).error.startsWith("Too many")) limited = true;
    else await sleep(200);
  }
  assert.ok(limited, "never rate limited");
});

await check("6 storage failure returns 503 and sends no email", async () => {
  stop(servers[0]);
  await sleep(2000);
  servers.push(start(B, badFile));
  await waitUp(B);
  const mails = sent.length;
  const res = await post(B, { ...valid(), submissionId: randomUUID(), token: await token(B) });
  assert.equal(res.status, 503);
  assert.equal(sent.length, mails);
});

for (const s of servers) stop(s);
mock.close();
const failed = results.filter(([s]) => s === "FAIL").length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
