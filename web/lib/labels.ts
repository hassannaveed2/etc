import type {
  ClientSector,
  FaqCategory,
  NoticeType,
  ResourceType,
  Status,
  TestCategory,
} from "@prisma/client";

/** Enum value → the mockup's display label and the lowercase URL param used in filters. */
export type LabelMap<E extends string> = Record<E, { label: string; param: string }>;

export const TEST_CATEGORY: LabelMap<TestCategory> = {
  ADMISSIONS: { label: "Admissions", param: "admissions" },
  POSTGRADUATE: { label: "Postgraduate", param: "postgraduate" },
  LICENSING: { label: "Licensing", param: "licensing" },
  RECRUITMENT: { label: "Recruitment", param: "recruitment" },
};

export const NOTICE_TYPE: LabelMap<NoticeType> = {
  ADMISSION: { label: "Admission", param: "admission" },
  SCHEDULE: { label: "Schedule", param: "schedule" },
  RESULT: { label: "Result", param: "result" },
  RECRUITMENT: { label: "Recruitment", param: "recruitment" },
  GENERAL: { label: "General", param: "general" },
};

export const RESOURCE_TYPE: LabelMap<ResourceType> = {
  SYLLABUS: { label: "Syllabus", param: "syllabus" },
  SAMPLE_PAPER: { label: "Sample paper", param: "sample-paper" },
  GUIDE: { label: "Guide", param: "guide" },
  POLICY: { label: "Policy", param: "policy" },
};

export const FAQ_CATEGORY: LabelMap<FaqCategory> = {
  REGISTRATION: { label: "Registration", param: "registration" },
  TEST_DAY: { label: "Test day", param: "test-day" },
  RESULTS: { label: "Results", param: "results" },
  FEES: { label: "Fees", param: "fees" },
  ACCESSIBILITY: { label: "Accessibility", param: "accessibility" },
  INSTITUTIONS: { label: "Institutions", param: "institutions" },
};

export const STATUS: LabelMap<Status> = {
  OPEN: { label: "Open", param: "open" },
  CLOSING: { label: "Closing soon", param: "closing" },
  RESULT: { label: "Result announced", param: "result" },
  CLOSED: { label: "Closed", param: "closed" },
};

export const CLIENT_SECTOR: LabelMap<ClientSector> = {
  FEDERAL: { label: "Federal", param: "federal" },
  PROVINCIAL: { label: "Provincial", param: "provincial" },
  UNIVERSITY: { label: "Universities", param: "universities" },
  OTHER: { label: "Other", param: "other" },
};

/** Reverse lookup from a URL param; unknown or missing params give undefined. */
export function fromParam<E extends string>(map: LabelMap<E>, param: string | undefined): E | undefined {
  if (!param) return undefined;
  return (Object.keys(map) as E[]).find((k) => map[k].param === param);
}
