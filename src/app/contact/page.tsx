import InquiryForm from "@/components/InquiryForm";
import ArrowIcon from "@/components/ArrowIcon";
import PageHero from "@/components/sections/PageHero";
export default function Contact() {
  return (
    <div className="rs-contact">
      <PageHero
        eyebrow="Let’s create together"
        title={<>Your celebration <em>starts here.</em></>}
        subtitle="A few details are all we need to begin. Share your occasion, your date, and what you’re imagining."
      />
      <section className="section-wrap contact-layout contact-section">
        <aside>
          <p className="eyebrow">A thoughtful first step</p>
          <h2>
            Bring the idea.
            <br />
            <em>We&apos;ll help with the details.</em>
          </h2>
          <p>
            Your date, location, inspiration, and comfortable budget help us
            recommend the right design and support.
          </p>
          <p>
            An inquiry begins the conversation. Availability, scope, and booking
            details are confirmed together.
          </p>
          <div className="inquiry-next">
            <h3>What happens next?</h3>
            <p>
              Rickya usually reaches out within a few minutes by phone or
              text. You&apos;ll talk through your date, location, and priorities,
              then availability and the right scope. If it feels like a fit, your
              custom proposal sets out the design, responsibilities, and booking
              steps.
            </p>
            <a className="text-link" href="/investment">
              Understand your event investment <ArrowIcon />
            </a>
          </div>
          <p className="mt-6">Atlanta, Georgia &amp; surrounding areas.</p>
        </aside>
        <InquiryForm />
      </section>
    </div>
  );
}
