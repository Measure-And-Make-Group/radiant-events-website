export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  sent: "If that address is authorized, a sign-in link is on its way. It works once and expires in 15 minutes.",
  link: "That sign-in link is invalid, expired, or already used. Please request a new one.",
  config: "Sign-in is not available right now. Email delivery is not configured.",
};

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const q = await searchParams;
  const message = q.sent ? messages.sent : q.error ? messages[q.error] : null;
  return (
    <section className="mx-auto max-w-md">
      <p className="eyebrow">Private</p>
      <h1 className="font-display text-4xl mb-4">Inquiry inbox</h1>
      <p className="mb-6 text-sm">
        Enter the studio email address to receive a one-time sign-in link.
      </p>
      {message && (
        <p role="status" className="mb-6 border border-current p-3 text-sm">
          {message}
        </p>
      )}
      <form method="post" action="/api/admin/login" className="space-y-4">
        <label className="block text-sm" htmlFor="email">
          Email address
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 block w-full border border-current bg-transparent p-3"
          />
        </label>
        <button className="btn-primary" type="submit">
          Email me a sign-in link
        </button>
      </form>
    </section>
  );
}
