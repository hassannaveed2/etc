// Form-side schemas: the shared content schemas plus ids, the lock version and coercion from form strings.
import { z } from "zod";
import { normalizeTos } from "@/lib/admin/tos";
import { noticeAttachmentInput, noticeInput, testInput, tosInput, usatCategoryInput } from "./content";

/** Checkbox/switch: present ("on") means true. */
export const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());

/** Optional foreign key from a select or media picker: "" → null. */
export const idOrNull = z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().int().positive().nullable());

/** Required foreign key with a plain-English message when nothing was chosen. */
export const requiredId = (message: string) =>
  z.preprocess((v) => (v === "" || v == null ? undefined : Number(v)), z.number({ error: message }).int().positive({ error: message }));

/** Whole number from a text/number input. */
export const intField = (message: string) =>
  z.preprocess((v) => (v === "" || v == null ? undefined : Number(v)), z.number({ error: message }).int({ error: message }));

/** Optional date input: "" → null. */
export const optionalDate = (label: string) =>
  z.preprocess((v) => (v === "" || v == null ? null : v), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, `Enter ${label}.`).nullable());

/** The record's updatedAt when the form was opened (optimistic lock). */
export const version = z.string().optional();

export const noticeForm = noticeInput.extend({
  id: idOrNull.optional().default(null),
  updatedAt: version,
  testId: idOrNull.optional().default(null),
  deadline: optionalDate("a deadline"),
  published: checkbox,
  isSample: checkbox,
  attachments: z.array(noticeAttachmentInput.extend({ mediaId: requiredId("Choose a PDF for this attachment.") })).default([]),
});
export type NoticeFormInput = z.infer<typeof noticeForm>;

export const idInput = z.object({ id: z.number().int().positive() });
export const publishInput = z.object({ id: z.number().int().positive(), published: z.boolean() });

/** USAT-style streams: empty list → null; level counts come in as strings. */
const categoriesForm = z.preprocess(
  (raw) =>
    Array.isArray(raw) && raw.length
      ? raw.map((c: { levels?: unknown[] }) => ({ ...c, levels: (c.levels ?? []).map((v) => (v === "" ? 0 : Number(v))) }))
      : null,
  z.array(usatCategoryInput).nullable(),
);

export const testForm = testInput
  .extend({
    id: idOrNull.optional().default(null),
    updatedAt: version,
    imageId: idOrNull.optional().default(null),
    published: checkbox,
    feeByAgreement: checkbox.optional(),
    fee: z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number({ error: "Enter the fee as a whole number of rupees." }).int().min(0, "Enter a fee of zero or more.").nullable()),
    sortOrder: z.preprocess((v) => (v === "" || v == null ? 0 : Number(v)), z.number().int()),
    categories: categoriesForm,
    tos: z.preprocess(normalizeTos, tosInput.nullable()),
    syllabus: z.preprocess((v) => (Array.isArray(v) ? v : []), testInput.shape.syllabus),
    sections: z.preprocess((v) => (Array.isArray(v) ? v : []), testInput.shape.sections),
  })
  .transform((t) => ({ ...t, fee: t.feeByAgreement ? null : t.fee }));
export type TestFormInput = z.infer<typeof testForm>;
