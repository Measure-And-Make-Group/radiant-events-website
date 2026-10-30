import {
  SESSION_COOKIE,
  SESSION_TTL_MS,
  adminEmails,
  sameOrigin,
  sessionToken,
  verify,
} from "@/lib/auth";
import { claimMarker } from "@/lib/inquiry-store";
import { cookies } from "next/headers";

export const runtime = "nodejs";

/** Exchanges a one-time login token (POSTed from /admin/verify) for a session cookie. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response("Forbidden", { status: 403 });
  const form = await request.formData();
  const login = verify<{ email: string; jti: string }>(
    "login",
    String(form.get("token") ?? ""),
  );
  const fail = () =>
    Response.redirect(new URL("/admin/login?error=link", request.url), 303);
  if (!login || !adminEmails().includes(login.email)) return fail();
  let first = false;
  try {
    first = await claimMarker(`admin/used-${login.jti}`);
  } catch {
    return fail();
  }
  if (!first) return fail();
  (await cookies()).set(SESSION_COOKIE, sessionToken(login.email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
  return Response.redirect(new URL("/admin/inquiries", request.url), 303);
}
