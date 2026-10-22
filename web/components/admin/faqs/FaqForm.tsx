"use client";

import { AdminForm, Panel, type FormAction } from "@/components/admin/AdminForm";
import { Select, TextArea, TextField } from "@/components/admin/fields/TextField";
import { Toggle } from "@/components/admin/fields/Toggle";
import { FAQ_CATEGORY } from "@/lib/labels";

export type FaqFormValues = { id?: number; category: string; question: string; answer: string; published: boolean; updatedAt?: string };

export function FaqForm({ action, faq }: { action: FormAction; faq: FaqFormValues }) {
  return (
    <AdminForm
      action={action}
      cancelHref="/admin/faqs"
      version={faq.updatedAt}
      viewHref={faq.id && faq.published ? "/faqs" : null}
      aside={
        <Panel title="Publishing">
          <Toggle name="published" label="Published" description="Shown on Help & FAQs." defaultChecked={faq.published} />
        </Panel>
      }
    >
      <Panel title="Question">
        <Select
          name="category"
          label="Topic"
          required
          placeholder="Choose a topic"
          defaultValue={faq.category}
          options={Object.entries(FAQ_CATEGORY).map(([value, c]) => ({ value, label: c.label }))}
        />
        <TextField name="question" label="Question" required maxLength={500} defaultValue={faq.question} />
        <TextArea name="answer" label="Answer" required rows={6} maxLength={5000} defaultValue={faq.answer} hint="Plain text. Keep it short and practical." />
      </Panel>
    </AdminForm>
  );
}
