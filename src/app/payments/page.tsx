import type { Metadata } from "next";
import PageHero from "@/components/sections/PageHero";
import Link from "next/link";
import ArrowIcon from "@/components/ArrowIcon";

export const metadata: Metadata = {
  title: "Payments & Deposits",
  robots: { index: false, follow: true },
};
export const dynamic = "force-dynamic";
function stripeLink(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      ["buy.stripe.com", "checkout.stripe.com"].includes(url.hostname) &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export default function Payments() {
  const payment = stripeLink(process.env.STRIPE_PAYMENT_LINK);
  const deposit = stripeLink(process.env.STRIPE_DEPOSIT_PAYMENT_LINK);
  return (
    <div>
      <PageHero
        eyebrow="For our booked clients"
        title="One more detail, thoughtfully handled."
        subtitle="Payments and deposits for your Radiant celebration."
      />
      <section className="section-wrap payment-section">
        <h2>
          Your celebration.
          <br />
          <em>Your confirmed plan.</em>
        </h2>
        <p>
          For a confirmed booking, use the secure Stripe link to enter the
          custom deposit or payment amount agreed in your proposal. Include the
          same name and email you used for your booking.
        </p>
        <p>
          Please follow the amount and schedule in your agreed proposal or
          invoice. A payment does not independently confirm event availability
          or replace your booking agreement.
        </p>
        {payment || deposit ? (
          <div className="hero-actions">
            {deposit ? (
              <a
                className="button-primary"
                href={deposit}
                rel="noopener noreferrer"
              >
                Pay your deposit <ArrowIcon />
              </a>
            ) : null}
            {payment ? (
              <a className="text-link" href={payment} rel="noopener noreferrer">
                Make a payment <ArrowIcon />
              </a>
            ) : null}
          </div>
        ) : (
          <div className="payment-request">
            <h3>Need your payment link?</h3>
            <p>
              We&apos;ll send the secure link for your confirmed booking.
              Include your name and event date so we can match it to your
              proposal.
            </p>
            <Link className="button-primary" href="/contact">
              Request your payment link <ArrowIcon />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
