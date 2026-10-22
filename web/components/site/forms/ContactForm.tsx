"use client";

import { CONTACT_SUBJECTS } from "@/lib/validation/form-options";
import { FormShell, type FormAction } from "./FormShell";

export function ContactForm({ action }: { action: FormAction }) {
  return (
    <FormShell
      action={action}
      className="relative mt-6 rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8"
      submitLabel="Send message"
      successTitle="Thank you — your message has been received"
      successText="The ETC support team will reply to the email address you provided."
      footnote="Please do not include passwords or payment details."
      fields={[
        { name: "name", label: "Full name", required: true, autoComplete: "name", idPrefix: "c" },
        { name: "email", label: "Email", type: "email", required: true, autoComplete: "email", idPrefix: "c" },
        { name: "subject", label: "Subject", type: "select", required: true, options: [...CONTACT_SUBJECTS], placeholder: "Choose a subject", wide: true, idPrefix: "c" },
        { name: "message", label: "Message", type: "textarea", required: true, wide: true, rows: 6, idPrefix: "c" },
      ]}
    />
  );
}
