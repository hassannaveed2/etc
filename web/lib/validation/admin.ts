// Form-side schemas: the shared content schemas plus ids, the lock version and coercion from form strings.
import { z } from "zod";
import { noticeAttachmentInput, noticeInput } from "./content";

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
