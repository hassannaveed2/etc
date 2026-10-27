import { describe, expect, test, vi } from "vitest";
import { contactInput, enquiryInput, processSubmission, RATE_LIMITED } from "@/lib/validation/forms";
import { createRateLimiter } from "@/lib/rate-limit";

const enquiry = {
  organization: "Punjab Public Service Commission",
  contactPerson: "Ayesha Khan",
  email: "ayesha@ppsc.gov.pk",
  phone: "",
  service: "Recruitment & screening",
  candidates: "1200",
  timeline: "1–3 months",
  message: "Screening test for 40 posts.",
};
const contact = { name: "Bilal Ahmed", email: "bilal@example.com", subject: "Results", message: "When are results out?" };

const fd = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
};

describe("enquiryInput", () => {
  test("a valid enquiry parses, with candidates as a number and an empty phone as null", () => {
    expect(enquiryInput.parse(enquiry)).toMatchObject({ candidates: 1200, phone: null });
  });
  test("candidates must be greater than zero", () => {
    expect(enquiryInput.safeParse({ ...enquiry, candidates: "0" }).error!.issues[0].message).toBe("Enter a number greater than zero.");
    expect(enquiryInput.safeParse({ ...enquiry, candidates: "1.5" }).error!.issues[0].message).toBe("Enter a number greater than zero.");
  });
  test("an empty form gives seven errors using the mockup labels", () => {
    const messages = enquiryInput.safeParse({}).error!.issues.map((i) => i.message);
    expect(messages).toEqual([
      "Organization is required.",
      "Contact person is required.",
      "Official email is required.",
      "Choose a service.",
      "Estimated candidates is required.",
      "Choose a timeline.",
      "Message is required.",
    ]);
  });
  test("service and timeline must be one of the mockup options", () => {
    expect(enquiryInput.safeParse({ ...enquiry, service: "Hacking" }).error!.issues[0].message).toBe("Choose a service.");
    expect(enquiryInput.safeParse({ ...enquiry, timeline: "Yesterday" }).error!.issues[0].message).toBe("Choose a timeline.");
  });
});

describe("contactInput", () => {
  test("email must look like an address", () => {
    expect(contactInput.safeParse({ ...contact, email: "bad" }).error!.issues[0].message).toBe("Enter an email address like name@example.com.");
  });
  test("name is required", () => {
    expect(contactInput.safeParse({ ...contact, name: "" }).error!.issues[0].message).toBe("Full name is required.");
  });
  test("lengths are capped: message 5000, other fields 200", () => {
    expect(contactInput.safeParse({ ...contact, message: "x".repeat(5001) }).error!.issues[0].message).toBe("Message must be 5000 characters or fewer.");
    expect(contactInput.safeParse({ ...contact, name: "x".repeat(201) }).error!.issues[0].message).toBe("Full name must be 200 characters or fewer.");
    expect(contactInput.safeParse({ ...contact, message: "x".repeat(5000) }).success).toBe(true);
  });
});

describe("processSubmission", () => {
  const deps = () => ({
    ip: "203.0.113.9",
    limiter: createRateLimiter({ limit: 2, windowMs: 60_000 }),
    store: vi.fn(async (_data: unknown, _ipHash: string) => {}),
    notify: vi.fn(async () => "skipped" as const),
  });

  test("a filled honeypot looks like success but stores and sends nothing", async () => {
    const d = deps();
    expect(await processSubmission(fd({ ...contact, website: "http://spam" }), contactInput, d)).toEqual({ status: "success" });
    expect(d.store).not.toHaveBeenCalled();
    expect(d.notify).not.toHaveBeenCalled();
  });

  test("invalid input returns field errors and echoes the typed values (not the honeypot)", async () => {
    const d = deps();
    const r = await processSubmission(fd({ ...contact, email: "bad", website: "" }), contactInput, d);
    expect(r.status).toBe("error");
    expect(r.fieldErrors).toEqual({ email: "Enter an email address like name@example.com." });
    expect(r.values).toEqual({ ...contact, email: "bad" });
    expect(d.store).not.toHaveBeenCalled();
  });

  test("a valid submission is stored with a hashed IP, then notified", async () => {
    const d = deps();
    expect(await processSubmission(fd(contact), contactInput, d)).toEqual({ status: "success" });
    expect(d.store).toHaveBeenCalledWith(contact, expect.stringMatching(/^[0-9a-f]{64}$/));
    expect(d.store.mock.calls[0][1]).not.toContain("203.0.113.9");
    expect(d.notify).toHaveBeenCalledWith(contact);
  });

  test("once the limit is reached further submissions are refused; mistakes don't count", async () => {
    const d = deps();
    await processSubmission(fd({ ...contact, email: "bad" }), contactInput, d);
    await processSubmission(fd(contact), contactInput, d);
    await processSubmission(fd(contact), contactInput, d);
    const r = await processSubmission(fd(contact), contactInput, d);
    expect(r).toMatchObject({
      status: "error",
      formError: "You've sent several messages in the last hour. Please try again later or call the helpline.",
      values: contact,
    });
    expect(d.store).toHaveBeenCalledTimes(2);
  });

  test("a storage failure is reported without losing the typed values", async () => {
    const d = { ...deps(), store: vi.fn(async () => Promise.reject(new Error("db down"))) };
    const r = await processSubmission(fd(contact), contactInput, d);
    expect(r).toMatchObject({ status: "error", formError: "Sorry, we couldn't send your message. Please try again.", values: contact });
    expect(d.notify).not.toHaveBeenCalled();
  });

  test("a notification failure still confirms the saved message and counts towards the limit", async () => {
    const d = { ...deps(), notify: vi.fn(async () => { throw new Error("Notification failed for bilal@example.com"); }) };
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(await processSubmission(fd(contact), contactInput, d)).toEqual({ status: "success" });
      expect(d.store).toHaveBeenCalledOnce();
      expect(d.notify).toHaveBeenCalledOnce();
      expect(log).toHaveBeenCalledExactlyOnceWith("Stored form submission could not be notified.");
      await processSubmission(fd(contact), contactInput, d);
      expect(await processSubmission(fd(contact), contactInput, d)).toMatchObject({ status: "error", formError: RATE_LIMITED });
      expect(d.store).toHaveBeenCalledTimes(2);
    } finally {
      log.mockRestore();
    }
  });

  test("storage errors do not log submitted personal data", async () => {
    const d = { ...deps(), store: vi.fn(async () => { throw new Error("Invalid data: bilal@example.com"); }) };
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(await processSubmission(fd(contact), contactInput, d)).toMatchObject({ status: "error", values: contact });
      expect(log).toHaveBeenCalledExactlyOnceWith("Form submission could not be stored.");
      expect(d.limiter.blocked(`form|${d.ip}`)).toBe(false);
    } finally {
      log.mockRestore();
    }
  });
});

describe("testRoutesEnabled", () => {
  test("only in e2e runs, never on production", async () => {
    const { testRoutesEnabled } = await import("@/lib/test-routes");
    expect(testRoutesEnabled({ E2E: "1", NEXT_PUBLIC_SITE_ENV: "development" })).toBe(true);
    expect(testRoutesEnabled({ E2E: "1", NEXT_PUBLIC_SITE_ENV: "production" })).toBe(false);
    expect(testRoutesEnabled({ NEXT_PUBLIC_SITE_ENV: "staging" })).toBe(false);
    expect(testRoutesEnabled({})).toBe(false);
  });
});
