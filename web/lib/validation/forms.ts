// Public form schemas (institutions enquiry, contact) and the submission pipeline shared by their server actions.
import { z } from "zod";
import type { FormState } from "@/components/site/forms/FormShell";
import { hashIp } from "@/lib/ip";
import type { RateLimiter } from "@/lib/rate-limit";
import { CONTACT_SUBJECTS, ENQUIRY_SERVICES, ENQUIRY_TIMELINES } from "./form-options";

const text = (label: string, max = 200) =>
  z
    .string(`${label} is required.`)
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} must be ${max} characters or fewer.`);
const email = (label: string) =>
  text(label).pipe(z.email("Enter an email address like name@example.com."));
const choice = (options: readonly string[], message: string) =>
  z.string(message).refine((v) => options.includes(v), message);

export const enquiryInput = z.object({
  organization: text("Organization"),
  contactPerson: text("Contact person"),
  email: email("Official email"),
  phone: z
    .string()
    .trim()
    .max(50, "Phone must be 50 characters or fewer.")
    .nullish()
    .transform((v) => v || null),
  service: choice(ENQUIRY_SERVICES, "Choose a service."),
  candidates: text("Estimated candidates", 20)
    .regex(/^\d{1,7}$/, "Enter a number greater than zero.")
    .transform(Number)
    .refine((n) => n > 0, "Enter a number greater than zero."),
  timeline: choice(ENQUIRY_TIMELINES, "Choose a timeline."),
  message: text("Message", 5000),
});
export type EnquiryInput = z.infer<typeof enquiryInput>;

export const contactInput = z.object({
  name: text("Full name"),
  email: email("Email"),
  subject: choice(CONTACT_SUBJECTS, "Choose a subject."),
  message: text("Message", 5000),
});
export type ContactInput = z.infer<typeof contactInput>;

export const RATE_LIMITED =
  "You've sent several messages in the last hour. Please try again later or call the helpline.";
const STORE_FAILED = "Sorry, we couldn't send your message. Please try again.";

export type SubmissionDeps<T> = {
  ip: string;
  limiter: RateLimiter;
  store(data: T, ipHash: string): Promise<void>;
  notify(data: T): Promise<unknown>;
  salt?: string;
};

/**
 * Honeypot → rate limit → validate → store (IP hashed) → notify. Only stored submissions count towards the limit, so
 * someone correcting mistakes isn't locked out. Values are echoed back on every error so nothing typed is lost.
 */
export async function processSubmission<T>(fd: FormData, schema: z.ZodType<T>, deps: SubmissionDeps<T>): Promise<FormState> {
  if (String(fd.get("website") ?? "").trim()) return { status: "success" };

  const values: Record<string, string> = {};
  for (const [k, v] of fd.entries()) if (k !== "website" && !k.startsWith("$ACTION") && typeof v === "string") values[k] = v;

  const key = `form|${deps.ip}`;
  if (deps.limiter.blocked(key)) return { status: "error", formError: RATE_LIMITED, values };

  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { status: "error", fieldErrors, values };
  }

  try {
    await deps.store(parsed.data, hashIp(deps.ip, deps.salt ?? process.env.IP_HASH_SALT ?? ""));
  } catch (e) {
    console.error("Form submission could not be stored:", e instanceof Error ? e.message : e);
    return { status: "error", formError: STORE_FAILED, values };
  }
  deps.limiter.hit(key);
  await deps.notify(parsed.data);
  return { status: "success" };
}
