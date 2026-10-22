// Plain, serialisable shapes returned by lib/content/* (cached as JSON; dates are "YYYY-MM-DD").
import type {
  FaqCategory,
  LeaderRole,
  NoticeType,
  ResourceType,
  Status,
  TestCategory,
} from "@prisma/client";

export type MediaRef = { url: string; alt: string; width: number | null; height: number | null };

export type TestCard = {
  slug: string;
  code: string;
  name: string;
  short: string;
  category: TestCategory;
  level: string;
  audience: string;
  fee: number | null;
  frequency: string;
  image: MediaRef | null;
};

export type UsatCategory = { code: string; stream: string; subjects: string; levels: number[] };
export type Tos = { levels: string[]; rows: { area: string; v: number[]; total: number; subtotal?: boolean }[] };

export type NoticeRow = {
  slug: string;
  title: string;
  type: NoticeType;
  testSlug: string | null;
  testCode: string;
  status: Status;
  summary: string;
  publishedAt: string;
  deadline: string | null;
  isSample: boolean;
};

export type ResourceCard = {
  id: number;
  title: string;
  type: ResourceType;
  testCode: string;
  fileUrl: string;
  sizeLabel: string;
  date: string;
  isSample: boolean;
};

export type ScheduleItem = {
  session: string;
  testSlug: string;
  testCode: string;
  regCloses: string;
  testDate: string;
  status: Status;
};

export type TestDetail = TestCard & {
  purpose: string;
  eligibility: string;
  measures: string;
  frequencyNote: string;
  resultsUse: string;
  patternNote: string;
  reliability: string;
  syllabus: string[];
  categories: UsatCategory[] | null;
  tos: Tos | null;
  sections: { name: string; items: string | null; detail: string }[];
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: string;
  notices: NoticeRow[];
  resources: ResourceCard[];
  schedule: ScheduleItem | null;
};

export type NoticeDetail = NoticeRow & {
  bodyHtml: string;
  attachments: { label: string; url: string; sizeLabel: string }[];
  related: NoticeRow[];
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: string;
};

export type Paged<T> = { items: T[]; total: number; page: number; pages: number };

export type FaqItem = { id: number; category: FaqCategory; question: string; answer: string };

export type HeroSlideItem = {
  id: number;
  eyebrow: string;
  title: string;
  body: string;
  image: MediaRef;
  cta1Label: string | null;
  cta1Href: string | null;
  cta2Label: string | null;
  cta2Href: string | null;
};

export type StatItem = { value: number; label: string; note: string };

export type LeaderItem = {
  role: LeaderRole;
  name: string;
  title: string;
  quote: string;
  messageHtml: string;
  photo: MediaRef | null;
};
