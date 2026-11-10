import { authConfigured, formToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Issues a short-lived signed token the form must send back with its inquiry. */
export async function GET() {
  if (!authConfigured())
    return Response.json({ error: "Unavailable" }, { status: 503 });
  return Response.json(
    { token: formToken() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
