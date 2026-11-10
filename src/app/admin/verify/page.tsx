import { verify } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** The link in the email lands here; signing in needs an explicit click (POST) so mail scanners cannot use it up. */
export default async function Verify({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const valid = !!verify("login", token);
  return (
    <section className="mx-auto max-w-md">
      <h1 className="font-display text-4xl mb-4">Sign in</h1>
      {valid ? (
        <form method="post" action="/api/admin/session">
          <input type="hidden" name="token" value={token} />
          <p className="mb-6 text-sm">Continue to the private inquiry inbox.</p>
          <button className="btn-primary" type="submit">
            Sign in
          </button>
        </form>
      ) : (
        <p className="text-sm">
          This link is invalid or has expired.{" "}
          <a className="underline" href="/admin/login">
            Request a new one
          </a>
          .
        </p>
      )}
    </section>
  );
}
