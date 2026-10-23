import nodemailer from "nodemailer";
import { getEnv, type Env } from "@/lib/env";

export type Notification = { to: string; subject: string; text: string; replyTo?: string };
export type SendResult = "sent" | "skipped" | "failed";

type Smtp = Partial<Pick<Env, "SMTP_HOST" | "SMTP_PORT" | "SMTP_USER" | "SMTP_PASS" | "SMTP_FROM">>;
type Transport = { sendMail(mail: Record<string, unknown>): Promise<unknown> };
type Deps = { smtp?: Smtp; createTransport?: (opts: Record<string, unknown>) => Transport };

/**
 * Emails an inbox notification to staff. Never throws: a missing SMTP setup or recipient is "skipped", a transport
 * error is logged and "failed" — the submission is already stored either way.
 */
export async function sendNotification(msg: Notification, deps: Deps = {}): Promise<SendResult> {
  const smtp = deps.smtp ?? getEnv();
  if (!smtp.SMTP_HOST) {
    console.info("SMTP not configured; notification skipped");
    return "skipped";
  }
  if (!msg.to) return "skipped";
  const port = smtp.SMTP_PORT ?? 587;
  try {
    const transport = (deps.createTransport ?? nodemailer.createTransport)({
      host: smtp.SMTP_HOST,
      port,
      secure: port === 465,
      auth: smtp.SMTP_USER ? { user: smtp.SMTP_USER, pass: smtp.SMTP_PASS } : undefined,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
    await transport.sendMail({
      from: smtp.SMTP_FROM ?? smtp.SMTP_USER,
      to: msg.to,
      replyTo: msg.replyTo,
      subject: msg.subject.replace(/[\r\n]+/g, " "),
      text: msg.text,
    });
    return "sent";
  } catch (e) {
    console.error("Notification email failed:", e instanceof Error ? e.message : e);
    return "failed";
  }
}

/** Plain-text body: "Label: value" per line; multi-line values start on their own line. */
export function formatNotification(fields: [label: string, value: string | number | null | undefined][]): string {
  return fields
    .map(([label, v]) => {
      const value = v === null || v === undefined || v === "" ? "—" : String(v);
      return value.includes("\n") ? `${label}:\n${value}\n` : `${label}: ${value}\n`;
    })
    .join("");
}
