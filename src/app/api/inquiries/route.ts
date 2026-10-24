import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { inquirySchema } from "@/lib/inquiry-schema";

export const runtime = "nodejs";
export async function POST(request: Request) {
  const reply = (body: object, status: number) =>
    Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return reply({ error: "Please submit from the Radiant website." }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return reply({ error: "Invalid request format." }, 415);
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).length > 12000)
      return reply({ error: "Your message is too long." }, 413);
    const result = inquirySchema.safeParse(JSON.parse(text));
    if (!result.success)
      return reply(
        {
          error: "Please review your details.",
          fields: result.error.flatten().fieldErrors,
        },
        400,
      );
    const reference = randomUUID();
    await put(
      `inquiries/${new Date().toISOString().slice(0, 10)}/${reference}.json`,
      JSON.stringify({
        reference,
        receivedAt: new Date().toISOString(),
        status: "new",
        ...result.data,
        company: undefined,
      }),
      {
        access: "private",
        contentType: "application/json",
        addRandomSuffix: false,
      },
    );
    return reply({ reference }, 201);
  } catch (error) {
    if (error instanceof SyntaxError)
      return reply({ error: "Invalid request format." }, 400);
    console.error("Inquiry storage unavailable");
    return reply(
      {
        error:
          "We couldn't send your inquiry. Please try again in a moment.",
      },
      503,
    );
  }
}
