import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Stateless HMAC tokens, keyed from INQUIRY_FORM_SECRET with a separate
 * context per purpose, so a form token can never be used as a login or
 * session token.
 */
type Purpose = "form" | "login" | "session";

function key(purpose: Purpose) {
  const secret = process.env.INQUIRY_FORM_SECRET;
  if (secret && secret.length >= 16)
    return createHmac("sha256", secret).update(`radiant:${purpose}:v1`).digest();
  if (process.env.NODE_ENV !== "production")
    return createHmac("sha256", "local-dev-only-secret").update(purpose).digest();
  return null;
}
export const authConfigured = () => key("session") !== null;

const b64 = (value: string | Buffer) => Buffer.from(value).toString("base64url");

export function sign(purpose: Purpose, payload: Record<string, unknown>) {
  const k = key(purpose);
  if (!k) throw new Error("INQUIRY_FORM_SECRET is not configured");
  const body = b64(JSON.stringify(payload));
  return `${body}.${b64(createHmac("sha256", k).update(body).digest())}`;
}

export function verify<T extends Record<string, unknown>>(
  purpose: Purpose,
  token: string | undefined,
): T | null {
  const k = key(purpose);
  if (!k || !token) return null;
  const [body, sig, extra] = token.split(".");
  if (!body || !sig || extra !== undefined) return null;
  const expected = createHmac("sha256", k).update(body).digest();
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected))
    return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (typeof payload.exp === "number" && payload.exp < Date.now()) return null;
    return payload as T;
  } catch {
    return null;
  }
}

export const formToken = () => sign("form", { iat: Date.now() });
export function formTokenAge(token: string | undefined) {
  const payload = verify<{ iat: number }>("form", token);
  return payload ? Date.now() - payload.iat : null;
}

export function adminEmails() {
  return (process.env.ADMIN_EMAILS || process.env.INQUIRY_NOTIFICATION_EMAIL || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const LOGIN_TTL_MS = 15 * 60 * 1000;
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
export const SESSION_COOKIE = "radiant_admin";

export const loginToken = (email: string) =>
  sign("login", { email, jti: randomUUID(), exp: Date.now() + LOGIN_TTL_MS });
export const sessionToken = (email: string) =>
  sign("session", { email, exp: Date.now() + SESSION_TTL_MS });

export async function getAdminSession() {
  const store = await cookies();
  const session = verify<{ email: string }>("session", store.get(SESSION_COOKIE)?.value);
  if (!session || !adminEmails().includes(session.email)) return null;
  return session;
}

/** Same-origin check for state-changing admin requests. */
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
