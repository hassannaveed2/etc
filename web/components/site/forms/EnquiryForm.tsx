"use client";

import { ENQUIRY_SERVICES, ENQUIRY_TIMELINES } from "@/lib/validation/form-options";
import { FormShell, type FormAction } from "./FormShell";

export function EnquiryForm({ action }: { action: FormAction }) {
  return (
    <FormShell
      action={action}
      className="relative rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8 lg:col-span-8"
      submitLabel="Send enquiry"
      successTitle="Thank you — your enquiry has been received"
      successText="An ETC representative will contact you to discuss your requirements and arrange a requirement study."
      footnote="Protected by spam filtering."
      fields={[
        { name: "organization", label: "Organization", required: true, autoComplete: "organization", wide: true },
        { name: "contactPerson", label: "Contact person", required: true, autoComplete: "name" },
        { name: "email", label: "Official email", type: "email", required: true, autoComplete: "email" },
        { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
        { name: "service", label: "Service", type: "select", required: true, options: [...ENQUIRY_SERVICES], placeholder: "Choose a service" },
        { name: "candidates", label: "Estimated candidates", type: "number", required: true },
        { name: "timeline", label: "Timeline", type: "select", required: true, options: [...ENQUIRY_TIMELINES], placeholder: "Choose a timeline" },
        {
          name: "message",
          label: "Message",
          type: "textarea",
          required: true,
          wide: true,
          placeholder: "Posts, programme or decision the test must support",
        },
      ]}
    />
  );
}
