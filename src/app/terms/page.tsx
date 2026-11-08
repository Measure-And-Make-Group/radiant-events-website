import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Website & Booking Information",
  description:
    "Understand Radiant Events Planning website information, custom proposals, booking agreements, and payment responsibilities.",
  alternates: { canonical: "/terms" },
};
export default function Terms() {
  return (
    <article className="mx-auto max-w-2xl px-6 py-20">
      <p className="eyebrow">Before booking</p>
      <h1 className="font-display text-5xl mb-8">
        Website &amp; booking information
      </h1>
      <div className="space-y-6 text-sm leading-relaxed">
        <p>
          This website introduces Radiant Events, our services, and selected
          design work. Photography shows individual installations; each new
          design is scoped to its venue, materials, and celebration.
        </p>
        <h2 className="text-2xl">An inquiry starts a conversation</h2>
        <p>
          Submitting the inquiry form does not reserve a date, confirm pricing,
          or create a service agreement. Availability and the scope of your
          event are confirmed directly with Radiant.
        </p>
        <h2 className="text-2xl">Your custom proposal</h2>
        <p>
          Services, design details, delivery, installation, takedown, and any
          booking or payment requirements are discussed for your event and set
          out in your individual proposal or agreement. Website descriptions do
          not replace those agreed details.
        </p>
        <h2 className="text-2xl">Photography &amp; content</h2>
        <p>
          Contact Radiant before reusing the branding, photography, or original
          website content.
        </p>
      </div>
    </article>
  );
}
