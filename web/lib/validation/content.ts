// Content schemas shared by the seed, admin server actions and admin forms.
// Relation ids (testId, imageId, mediaId…) and the lock version are added by the admin schemas.
import { z } from "zod";
import {
  ClientSector,
  FaqCategory,
  LeaderRole,
  NoticeType,
  ResourceType,
  Status,
  TestCategory,
} from "@prisma/client";

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MESSAGE = "Enter a URL slug using English letters, numbers and hyphens.";

const text = (label: string, max = 200) =>
  z.string().trim().min(1, `${label} is required.`).max(max, `${label} must be ${max} characters or fewer.`);
const optionalText = (max: number) =>
  z.string().trim().max(max, `Must be ${max} characters or fewer.`).nullish().transform((v) => v || null);
const isoDate = (label: string) => z.string().regex(/^\d{4}-\d{2}-\d{2}$/, `Enter ${label}.`);
/** Internal path, in-page anchor or https URL. */
const href = z
  .string()
  .trim()
  .regex(/^(\/|#|https:\/\/)/, "Enter a link starting with /, # or https://.")
  .nullish()
  .transform((v) => v || null);

export const slug = z.string().trim().max(80, "Slugs must be 80 characters or fewer.").regex(SLUG_RE, SLUG_MESSAGE);

export const testSectionInput = z.object({
  name: text("Section name"),
  items: optionalText(50),
  detail: text("Section detail", 1000),
});

export const usatCategoryInput = z.object({
  code: text("Code", 40),
  stream: text("Stream", 100),
  subjects: text("Subjects", 300),
  levels: z.array(z.number().int().min(0)),
});

export const tosInput = z.object({
  levels: z.array(text("Level", 10)).min(1),
  rows: z.array(
    z.object({
      area: text("Area", 120),
      v: z.array(z.number().int().min(0)),
      total: z.number().int().min(0),
      subtotal: z.boolean().optional(),
    }),
  ),
});

export const testInput = z.object({
  slug,
  code: text("Code", 40),
  name: text("Name"),
  short: text("Short description", 500),
  category: z.enum(TestCategory),
  level: text("Level", 100),
  audience: text("Audience", 500),
  purpose: text("Purpose", 5000),
  eligibility: text("Eligibility", 5000),
  measures: text("What it measures", 5000),
  frequency: text("Frequency", 100),
  frequencyNote: text("Frequency note", 500),
  fee: z.number().int().min(0, "Enter a fee of zero or more.").nullable(),
  resultsUse: text("How results are used", 5000),
  patternNote: text("Pattern note", 5000),
  reliability: text("Reliability", 5000),
  syllabus: z.array(text("Syllabus item", 300)).min(1, "Add at least one syllabus item."),
  categories: z.array(usatCategoryInput).nullable(),
  tos: tosInput.nullable(),
  sortOrder: z.number().int().default(0),
  published: z.boolean(),
  seoTitle: optionalText(70),
  seoDescription: optionalText(160),
  sections: z.array(testSectionInput).min(1, "Add at least one pattern section."),
});

export const noticeAttachmentInput = z.object({ label: text("Attachment label") });

export const noticeInput = z.object({
  slug,
  title: text("Title"),
  type: z.enum(NoticeType),
  publishedAt: isoDate("the publish date"),
  deadline: isoDate("a deadline").nullable(),
  status: z.enum(Status),
  summary: text("Summary", 1000),
  bodyHtml: text("Body", 100_000),
  published: z.boolean(),
  isSample: z.boolean().default(false),
  seoTitle: optionalText(70),
  seoDescription: optionalText(160),
  attachments: z.array(noticeAttachmentInput).default([]),
});

export const resourceInput = z.object({
  title: text("Title"),
  type: z.enum(ResourceType),
  date: isoDate("the document date"),
  published: z.boolean(),
  isSample: z.boolean().default(false),
});

export const faqInput = z.object({
  category: z.enum(FaqCategory),
  question: text("Question", 500),
  answer: text("Answer", 5000),
  order: z.number().int().default(0),
  published: z.boolean(),
});

export const heroSlideInput = z.object({
  eyebrow: text("Eyebrow"),
  title: text("Title"),
  body: text("Body", 1000),
  cta1Label: optionalText(60),
  cta1Href: href,
  cta2Label: optionalText(60),
  cta2Href: href,
  order: z.number().int().default(0),
  published: z.boolean(),
});

export const scheduleEntryInput = z
  .object({
    session: text("Session"),
    regCloses: isoDate("the registration closing date"),
    testDate: isoDate("the test date"),
    status: z.enum(Status),
    published: z.boolean(),
  })
  .refine((s) => s.testDate >= s.regCloses, {
    message: "Test date must be on or after the registration closing date.",
    path: ["testDate"],
  });

export const statInput = z.object({
  value: z.number().int().min(0, "Enter a number of zero or more."),
  label: text("Label", 100),
  note: text("Note", 200),
  order: z.number().int().default(0),
});

export const clientInput = z.object({
  name: text("Name"),
  sector: z.enum(ClientSector),
  order: z.number().int().default(0),
});

export const leaderInput = z.object({
  role: z.enum(LeaderRole),
  name: text("Name"),
  title: text("Title"),
  quote: text("Quote", 1000),
  messageHtml: text("Message", 100_000),
});

export const SETTINGS_KEYS = [
  "helpline",
  "supportEmail",
  "address",
  "officeHours",
  "portalRegistrationUrl",
  "portalAdmitCardUrl",
  "portalResultsUrl",
  "enquiryNotifyEmail",
  "contactNotifyEmail",
] as const;
export type SettingKey = (typeof SETTINGS_KEYS)[number];

const portalUrl = z.string().trim().regex(/^(https:\/\/|#)/, "Enter a link starting with https://.");
const notifyEmail = z.union([z.literal(""), z.email("Enter an email address like name@example.com.")]);

export const settingsInput = z.object({
  helpline: text("Helpline", 100),
  supportEmail: text("Support email", 200),
  address: text("Address", 500),
  officeHours: text("Office hours", 200),
  portalRegistrationUrl: portalUrl,
  portalAdmitCardUrl: portalUrl,
  portalResultsUrl: portalUrl,
  enquiryNotifyEmail: notifyEmail,
  contactNotifyEmail: notifyEmail,
});
export type SiteSettings = z.infer<typeof settingsInput>;
