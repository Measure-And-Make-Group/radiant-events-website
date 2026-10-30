import { SESSION_COOKIE, sameOrigin } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response("Forbidden", { status: 403 });
  (await cookies()).delete(SESSION_COOKIE);
  return Response.redirect(new URL("/admin/login", request.url), 303);
}
