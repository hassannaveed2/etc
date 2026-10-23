import { describe, expect, test, vi } from "vitest";
import { formatNotification, sendNotification } from "@/lib/mail";

const msg = { to: "inbox@etc.hec.gov.pk", subject: "New enquiry", text: "Organization: PPSC", replyTo: "a@example.com" };
const smtp = { SMTP_HOST: "smtp.example.com", SMTP_PORT: 587, SMTP_USER: "u", SMTP_PASS: "p", SMTP_FROM: "ETC <no-reply@etc.hec.gov.pk>" };

describe("sendNotification", () => {
  test("without SMTP it returns skipped and logs why", async () => {
    const log = vi.spyOn(console, "info").mockImplementation(() => {});
    const createTransport = vi.fn();
    expect(await sendNotification(msg, { smtp: {}, createTransport })).toBe("skipped");
    expect(createTransport).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith("SMTP not configured; notification skipped");
    log.mockRestore();
  });

  test("with no recipient it returns skipped", async () => {
    const createTransport = vi.fn();
    expect(await sendNotification({ ...msg, to: "" }, { smtp, createTransport })).toBe("skipped");
    expect(createTransport).not.toHaveBeenCalled();
  });

  test("sends with the configured sender and reply-to; line breaks are stripped from the subject", async () => {
    const sendMail = vi.fn(async () => ({}));
    const createTransport = vi.fn(() => ({ sendMail }));
    expect(await sendNotification({ ...msg, subject: "New\r\nBcc: x@y.z" }, { smtp, createTransport })).toBe("sent");
    expect(createTransport).toHaveBeenCalledWith(expect.objectContaining({ host: "smtp.example.com", port: 587, auth: { user: "u", pass: "p" } }));
    expect(sendMail).toHaveBeenCalledWith({ from: smtp.SMTP_FROM, to: msg.to, replyTo: msg.replyTo, subject: "New Bcc: x@y.z", text: msg.text });
  });

  test("a transport error returns failed and does not throw", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const createTransport = () => ({ sendMail: async () => Promise.reject(new Error("ECONNREFUSED")) });
    await expect(sendNotification(msg, { smtp, createTransport })).resolves.toBe("failed");
    err.mockRestore();
  });
});

describe("formatNotification", () => {
  test("lists each field with its label, one per line", () => {
    expect(formatNotification([["Organization", "PPSC"], ["Phone", null], ["Message", "Line 1\nLine 2"]])).toBe(
      "Organization: PPSC\nPhone: —\nMessage:\nLine 1\nLine 2\n",
    );
  });
});
