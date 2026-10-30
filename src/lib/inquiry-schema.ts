import { z } from "zod";
import { siteConfig } from "@/lib/site-config";

export const guestCounts = [
  "Under 25",
  "25–50",
  "51–100",
  "101–200",
  "200+",
  "Still deciding",
] as const;

const oneOf = <T extends readonly [string, ...string[]]>(values: T) =>
  z.enum(values);
const optionalOneOf = <T extends readonly [string, ...string[]]>(values: T) =>
  z.union([z.literal(""), z.enum(values)]).optional();

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(120),
  email: z.string().trim().email("Please enter a valid email address.").max(254),
  phone: z.string().trim().max(40).optional(),
  eventType: z.enum(["Milestone celebration", "Shower or intimate gathering", "Wedding", "Brand or community gathering", "Something else"]),
  eventDate: z.string().trim().max(100),
  venueOrCity: z.string().trim().min(2, "Tell us the city or venue.").max(250),
  guestCount: z.union([z.literal(""), z.enum(guestCounts)]),
  servicesOfInterest: oneOf(siteConfig.servicesOfInterest),
  budget: oneOf(siteConfig.budgetRanges),
  message: z
    .string()
    .trim()
    .min(10, "Share a little more about your vision.")
    .max(4000),
  referral: optionalOneOf(siteConfig.referralSources),
  consent: z.literal(true, {
    error: "Please confirm we can contact you about your inquiry.",
  }),
  // Honeypot — should stay empty. Bots that fill every field will trip this.
  company: z.string().max(200).optional(),
  // Generated once per form visit and reused on retries so a retry can never
  // create a second inquiry or a second email.
  submissionId: z.string().uuid().optional(),
  // Short-lived signed token from GET /api/inquiries/token.
  token: z.string().max(200).optional(),
});

export type InquiryFormValues = z.infer<typeof inquirySchema>;
/** The fields that are stored and emailed (no honeypot or transport fields). */
export type InquiryDetails = Omit<
  InquiryFormValues,
  "company" | "submissionId" | "token" | "consent"
>;
