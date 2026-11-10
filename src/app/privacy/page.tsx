import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Inquiry Privacy",
  description:
    "How Radiant Events Planning handles your inquiry information and contact details through our private inquiry form and email.",
  alternates: { canonical: "/privacy" },
};
export default function Privacy() {
  return (
    <article className="mx-auto max-w-2xl px-6 py-20">
      <p className="eyebrow">Your inquiry</p>
      <h1 className="font-display text-5xl mb-8">
        Privacy &amp; your information
      </h1>
      <div className="space-y-6 text-sm leading-relaxed">
        <p>
          Our inquiry form collects the contact details and event information
          you choose to provide. Radiant Events uses those details to review
          your request, discuss your celebration, and prepare the next steps
          with you.
        </p>
        <h2 className="text-2xl">Site operation, cookies &amp; preferences</h2>
        <p>Our hosting provider, Vercel, processes technical request information needed to serve and secure the site, such as connection information and request metadata. We use a necessary admin-session cookie for authorized staff sign-in, short-lived browser session storage for the introductory animation, and local browser storage to remember your cookie preferences. These are not advertising trackers. You may reopen Cookie preferences in the website footer.</p>
        <p>Analytics and advertising tracking are currently not integrated into this website. Should we introduce them, optional tracking must remain off until you opt in. Rejecting optional cookies does not prevent you from browsing or sending an inquiry. You can withdraw optional consent at any time through Cookie preferences; previously received information may require a separate deletion request.</p>
        <h2 className="text-2xl">The inquiry form</h2>
        <p>
          Your inquiry is submitted directly through this website and stored in
          private storage on Vercel for REP to review. It is not published
          on the website or shared for advertising.
        </p>
        <h2 className="text-2xl">Emails we send</h2>
        <p>
          When you send an inquiry, we email a copy to the REP team and a
          confirmation to the address you provided. These messages are sent
          through our email provider, Resend, and are about your inquiry only.
          Sending an inquiry does not sign you up for marketing emails.
        </p>
        <h2 className="text-2xl">Processing providers and recipients</h2>
        <p>We use Vercel to host the website and store inquiries and Resend to deliver inquiry-related email. Service providers may process relevant information on our behalf. Our services are based in the United States; visitors in other countries should be aware information may be processed there.</p>
        <h2 className="text-2xl">Consent and how long we keep it</h2>
        <p>
          By ticking the consent box you agree that REP may contact you
          about your inquiry. We keep inquiry records for as long as needed to
          respond to you and to manage a booking, subject to applicable legal or operational retention requirements. You may request access, correction or deletion, or withdraw inquiry contact consent, through our contact form. We will review such requests under applicable law.
        </p>
        <h2 className="text-2xl">Spam protection</h2>
        <p>
          To keep the form free of spam, we use a hidden field, a short-lived
          form token, and a limit on how often one connection can submit. This
          uses a one-way scrambled version of your network address, not the
          address itself, and it is deleted within a couple of days.
        </p>
        <h2 className="text-2xl">Your choices and rights</h2>
        <p>Depending on where you live, you may have rights to request access to, correction of, or deletion of your personal information, and to opt out of certain uses. We do not currently use site analytics or advertising pixels. Where applicable, you may contact your local data protection regulator. We do not knowingly solicit personal information from children through the inquiry form.</p>
        <h2 className="text-2xl">What to include</h2>
        <p>
          Please share information relevant to your event. You do not need to
          provide payment card information, passwords, or sensitive personal
          records to begin an inquiry.
        </p>
        <h2 className="text-2xl">Questions or changes</h2>
        <p>
          To ask about information you have shared, request a correction, or
          discuss a deletion request, send a message through the{" "}
          <Link className="underline" href="/contact">
            contact form
          </Link>
          .
        </p>
      </div>
    </article>
  );
}
