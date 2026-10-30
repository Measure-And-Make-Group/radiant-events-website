"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { guestCounts, inquirySchema } from "@/lib/inquiry-schema";
import { siteConfig } from "@/lib/site-config";

const occasions = [
  "Milestone celebration",
  "Shower or intimate gathering",
  "Wedding",
  "Brand or community gathering",
  "Something else",
];
const newSubmissionId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "00000000-0000-4000-8000-" + Date.now().toString(16).padStart(12, "0");
const steps = ["Your occasion", "Your vision", "Your details", "Review & send"];
type Details = {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  venueOrCity: string;
  guestCount: string;
  servicesOfInterest: string;
  budget: string;
  message: string;
  referral: string;
  consent: boolean;
  company: string;
};
export default function InquiryForm() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Details>({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    eventDate: "",
    venueOrCity: "",
    guestCount: "",
    servicesOfInterest: "",
    budget: "",
    message: "",
    referral: "",
    consent: false,
    company: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState("");
  const [confirmationSent, setConfirmationSent] = useState(false);
  // Reused across retries so a retry can never create a second inquiry.
  const submissionId = useRef(newSubmissionId());
  const token = useRef<{ value: string; at: number } | null>(null);
  async function loadToken() {
    try {
      const res = await fetch("/api/inquiries/token", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.token) token.current = { value: data.token, at: Date.now() };
    } catch {
      /* the send step reports a retryable error */
    }
  }
  useEffect(() => {
    void loadToken();
  }, []);
  const heading = useRef<HTMLHeadingElement>(null);
  function update(key: keyof Details, value: string | boolean) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "", form: "" }));
  }
  function changeStep(next: number) {
    setStep(next);
    setErrors({});
    requestAnimationFrame(() => heading.current?.focus());
  }
  function advance() {
    const required =
      step === 0
        ? ["eventType", "venueOrCity"]
        : step === 1
          ? ["servicesOfInterest", "budget", "message"]
          : ["name", "email", "consent"];
    const result = inquirySchema.safeParse(values);
    const nextErrors: Record<string, string> = {};
    if (!result.success)
      for (const issue of result.error.issues)
        if (required.includes(String(issue.path[0])))
          nextErrors[String(issue.path[0])] = issue.message;
    for (const key of required)
      if (!values[key as keyof Details] && !nextErrors[key])
        nextErrors[key] = "Please complete this detail.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    changeStep(step + 1);
  }
  async function send() {
    if (busy) return;
    setBusy(true);
    setErrors({});
    try {
      if (!token.current || Date.now() - token.current.at > 5 * 3600_000) {
        await loadToken();
        if (!token.current) throw new Error("We couldn't reach the server. Your details are still here; please try again.");
      }
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          submissionId: submissionId.current,
          token: token.current.value,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (result.code === "session") await loadToken();
        throw new Error(
          result.error ||
            "We couldn't send your inquiry. Your details are still here; please try again.",
        );
      }
      setConfirmationSent(result.confirmationEmail === "sent");
      setReference(result.reference);
      requestAnimationFrame(() => heading.current?.focus());
    } catch (error) {
      setErrors({
        form:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
      });
    } finally {
      setBusy(false);
    }
  }
  function field(
    key: keyof Details,
    label: string,
    type = "text",
    optional = false,
  ) {
    return (
      <label className="inquiry-field" key={key} htmlFor={key}>
        <span>
          {label}
          {optional && <small>Optional</small>}
        </span>
        <input
          id={key}
          name={key}
          type={type}
          value={String(values[key])}
          maxLength={key === "email" ? 254 : 250}
          autoComplete={
            key === "name"
              ? "name"
              : key === "email"
                ? "email"
                : key === "phone"
                  ? "tel"
                  : "off"
          }
          onChange={(e) => update(key, e.target.value)}
          aria-invalid={!!errors[key]}
          aria-describedby={errors[key] ? `${key}-error` : undefined}
        />
        {errors[key] && (
          <small id={`${key}-error`} className="inquiry-error">
            {errors[key]}
          </small>
        )}
      </label>
    );
  }
  function select(
    key: keyof Details,
    label: string,
    options: readonly string[],
    optional = false,
  ) {
    return (
      <label className="inquiry-field" htmlFor={key}>
        <span>
          {label}
          {optional && <small>Optional</small>}
        </span>
        <select
          id={key}
          value={String(values[key])}
          onChange={(e) => update(key, e.target.value)}
          aria-invalid={!!errors[key]}
          aria-describedby={errors[key] ? `${key}-error` : undefined}
        >
          <option value="">Select an option</option>
          {options.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        {errors[key] && (
          <small id={`${key}-error`} className="inquiry-error">
            {errors[key]}
          </small>
        )}
      </label>
    );
  }
  if (reference)
    return (
      <div className="inquiry-shell inquiry-success">
        <p className="eyebrow">A beautiful beginning</p>
        <h2 ref={heading} tabIndex={-1}>
          Your vision is
          <br />
          <em>in good hands.</em>
        </h2>
        <p>
          Your inquiry has been received. We look forward to learning more about
          your celebration and will reply personally, usually within 12 to 24
          hours, using the email you shared.
        </p>
        <p className="inquiry-note" role="status">
          {confirmationSent
            ? "A confirmation is on its way to your inbox. If you don't see it, please check your spam folder."
            : "Your inquiry is saved. Our confirmation email is taking longer than usual, so please keep your reference below."}
        </p>
        <p className="inquiry-note">
          This begins a conversation; your date is reserved once your proposal
          and booking steps are confirmed.
        </p>
        <p className="inquiry-reference">Your reference: {reference}</p>
        <Link className="text-link" href="/client-guide">
          Explore your client guide <span aria-hidden="true">→</span>
        </Link>
      </div>
    );
  return (
    <form
      className="inquiry-shell"
      onSubmit={(e) => {
        e.preventDefault();
        if (step < 3) advance();
        else void send();
      }}
      noValidate
    >
      <div className="inquiry-top">
        <p className="eyebrow">Your event, thoughtfully considered</p>
        <span>0{step + 1} / 04</span>
      </div>
      <ol className="inquiry-progress" aria-label="Inquiry progress">
        {steps.map((s, i) => (
          <li key={s} aria-current={step === i ? "step" : undefined}>
            <span>{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
      <div className="inquiry-stage" key={step}>
        <h2 ref={heading} tabIndex={-1}>
          {
            [
              "What are we celebrating?",
              "How do you want it to feel?",
              "Let's stay connected.",
              "Your celebration, at a glance.",
            ][step]
          }
        </h2>
        <p className="inquiry-intro">
          {
            [
              "Every meaningful gathering starts with a reason. Tell us yours.",
              "Picture your guests walking in. The atmosphere, the details, the feeling you want them to carry home.",
              "Tell us how to reach you so we can begin shaping your vision together.",
              "Take a moment to review your details. You can go back and make changes before sending.",
            ][step]
          }
        </p>
        {step === 0 && (
          <>
            <fieldset className="occasion-choices">
              <legend className="inquiry-label">Your occasion</legend>
              {occasions.map((occasion, i) => (
                <label
                  key={occasion}
                  className={values.eventType === occasion ? "selected" : ""}
                >
                  <input
                    type="radio"
                    name="eventType"
                    value={occasion}
                    checked={values.eventType === occasion}
                    onChange={() => update("eventType", occasion)}
                  />
                  <span className="choice-index">0{i + 1}</span>
                  <span>{occasion}</span>
                </label>
              ))}
            </fieldset>
            {errors.eventType && (
              <p className="inquiry-error" role="alert">
                {errors.eventType}
              </p>
            )}
            <div className="inquiry-grid">
              {field(
                "eventDate",
                "Event date or preferred season",
                "text",
                true,
              )}
              {field("venueOrCity", "Venue or city")}
              {select("guestCount", "Estimated guests", guestCounts, true)}
            </div>
            <p className="inquiry-note">
              No date or venue yet? A season and city are a lovely place to
              start.
            </p>
          </>
        )}
        {step === 1 && (
          <>
            <div className="inquiry-grid">
              {select(
                "servicesOfInterest",
                "Where would you love support?",
                siteConfig.servicesOfInterest,
              )}
              {select(
                "budget",
                "Comfortable event investment",
                siteConfig.budgetRanges,
              )}
            </div>
            <label className="inquiry-field" htmlFor="message">
              <span>Tell us your vision</span>
              <textarea
                id="message"
                rows={5}
                maxLength={4000}
                value={values.message}
                placeholder="The occasion, the atmosphere, the details you love—and anything you'd love us to take off your shoulders."
                onChange={(e) => update("message", e.target.value)}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "message-error" : undefined}
              />
              {errors.message && (
                <small id="message-error" className="inquiry-error">
                  {errors.message}
                </small>
              )}
            </label>
            <p className="inquiry-note">
              You don&apos;t need a finished plan. Share what matters most;
              we&apos;ll help you find the way forward.
            </p>
          </>
        )}
        {step === 2 && (
          <>
            <div className="inquiry-grid">
              {field("name", "Full name")}
              {field("email", "Email address", "email")}
              {field("phone", "Phone number", "tel", true)}
              {select(
                "referral",
                "How did you discover Radiant?",
                siteConfig.referralSources,
                true,
              )}
            </div>
            <label className="inquiry-consent">
              <input
                type="checkbox"
                checked={values.consent}
                onChange={(e) => update("consent", e.target.checked)}
              />{" "}
              <span>
                I agree to be contacted about my inquiry and have read the{" "}
                <Link href="/privacy">privacy policy</Link>.
              </span>
            </label>
            {errors.consent && (
              <p className="inquiry-error" role="alert">
                {errors.consent}
              </p>
            )}
          </>
        )}
        {step === 3 && (
          <dl className="inquiry-review">
            {[
              ["Occasion", values.eventType],
              ["Date", values.eventDate || "To be discussed"],
              ["Location", values.venueOrCity],
              ["Guests", values.guestCount || "To be discussed"],
              ["Support", values.servicesOfInterest],
              ["Investment", values.budget],
              ["Your vision", values.message],
              [
                "Contact",
                `${values.name} · ${values.email}${values.phone ? ` · ${values.phone}` : ""}`,
              ],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      <div className="inquiry-honey" aria-hidden="true">
        <label htmlFor="company">
          Company
          <input
            id="company"
            tabIndex={-1}
            autoComplete="off"
            value={values.company}
            onChange={(e) => update("company", e.target.value)}
          />
        </label>
      </div>
      {errors.form && (
        <p className="inquiry-error" role="alert">
          {errors.form}
        </p>
      )}
      <div className="inquiry-actions">
        {step > 0 ? (
          <button
            type="button"
            className="text-link"
            disabled={busy}
            onClick={() => changeStep(step - 1)}
          >
            Back
          </button>
        ) : (
          <span className="inquiry-note">A few thoughtful minutes.</span>
        )}
        <button className="btn-primary" type="submit" disabled={busy}>
          {busy
            ? "Sending your vision…"
            : step === 3
              ? "Send your inquiry"
              : step === 2
                ? "Review your inquiry"
                : "Continue"}
          <span aria-hidden="true">→</span>
        </button>
      </div>
      <p className="inquiry-note inquiry-footer">
        Your details stay private. An inquiry carries no booking commitment.
      </p>
    </form>
  );
}
