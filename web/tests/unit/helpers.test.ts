import { test, expect, describe } from "vitest";
import { formatBytes, formatDate, formatFee, todayInKarachi, FEE_NOTE } from "@/lib/format";
import { slugify } from "@/lib/slug";
import {
  NEWS_PER_PAGE,
  RESOURCES_PER_PAGE,
  noticeWhere,
  paginate,
  parseNoticeFilters,
  parsePage,
  parseResourceFilters,
  resourceWhere,
  searchFaqs,
  sinceDate,
} from "@/lib/filters";
import { FAQ_CATEGORY, fromParam, NOTICE_TYPE } from "@/lib/labels";

const today = new Date("2026-10-22T00:00:00Z");
const iso = (d: Date | null) => d?.toISOString().slice(0, 10);

describe("format", () => {
  test("formatFee", () => {
    expect(formatFee(2000)).toBe("Rs. 2,000");
    expect(formatFee(0)).toBe("Rs. 0");
    expect(formatFee(null)).toBe("By agreement");
  });
  test("formatDate reads UTC parts from strings and dates", () => {
    expect(formatDate("2026-10-15")).toBe("15 Oct 2026");
    expect(formatDate(new Date("2026-01-05T00:00:00Z"))).toBe("5 Jan 2026");
    expect(formatDate(new Date("2026-12-31T23:30:00Z"))).toBe("31 Dec 2026");
  });
  test("todayInKarachi is UTC midnight of the Pakistan calendar date", () => {
    expect(todayInKarachi(new Date("2026-10-21T20:30:00Z")).toISOString()).toBe("2026-10-22T00:00:00.000Z");
    expect(todayInKarachi(new Date("2026-10-21T18:30:00Z")).toISOString()).toBe("2026-10-21T00:00:00.000Z");
  });
  test("formatBytes gives the mockup's size labels", () => {
    expect(formatBytes(1566)).toBe("2 KB");
    expect(formatBytes(430_080)).toBe("420 KB");
    expect(formatBytes(1_258_291)).toBe("1.2 MB");
    expect(formatBytes(200)).toBe("1 KB");
  });
  test("fee note copy", () => {
    expect(FEE_NOTE).toBe("As per ETC Institutional Profile 2026; always confirm in the official announcement.");
  });
});

describe("slugify", () => {
  test("lowercases, hyphenates and trims punctuation", () => {
    expect(slugify("USAT December 2026: Registration Open!")).toBe("usat-december-2026-registration-open");
    expect(slugify("  LAW-GAT — Q4 2026  ")).toBe("law-gat-q4-2026");
    expect(slugify("Café résumé")).toBe("cafe-resume");
  });
  test("caps at 80 characters without a trailing hyphen", () => {
    const s = slugify("word ".repeat(40));
    expect(s.length).toBeLessThanOrEqual(80);
    expect(s.endsWith("-")).toBe(false);
  });
  // Review Focus 5
  test("non-Latin titles give an empty slug", () => {
    expect(slugify("داخلہ ٹیسٹ کا اعلان")).toBe("");
  });
});

describe("paging", () => {
  // Review Focus 4
  test("parsePage tolerates garbage", () => {
    expect(parsePage(undefined)).toBe(1);
    expect(parsePage("abc")).toBe(1);
    expect(parsePage("-3")).toBe(1);
    expect(parsePage("2.7")).toBe(1);
    expect(parsePage(["2", "5"])).toBe(2);
    expect(parsePage("4")).toBe(4);
  });
  test("paginate clamps to the last page and handles empty lists", () => {
    expect(paginate(17, 999, 8)).toEqual({ page: 3, pages: 3, skip: 16, take: 8 });
    expect(paginate(17, 2, 8)).toEqual({ page: 2, pages: 3, skip: 8, take: 8 });
    expect(paginate(0, 1, 8)).toEqual({ page: 1, pages: 1, skip: 0, take: 8 });
  });
  test("page sizes", () => {
    expect(NEWS_PER_PAGE).toBe(8);
    expect(RESOURCES_PER_PAGE).toBe(12);
  });
});

describe("notice filters", () => {
  test("sinceDate maps a period to a lower bound relative to today", () => {
    expect(iso(sinceDate("30", today))).toBe("2026-09-22");
    expect(iso(sinceDate("90", today))).toBe("2026-07-24");
    expect(iso(sinceDate("year", today))).toBe("2026-01-01");
    expect(sinceDate(undefined, today)).toBeNull();
  });
  // Review Focus 4
  test("unknown values are dropped", () => {
    expect(parseNoticeFilters({ type: "foo", test: "nope", period: "7" }, ["usat"])).toEqual({ page: 1 });
  });
  test("valid values are kept and q is trimmed", () => {
    expect(parseNoticeFilters({ type: "result", test: "usat", q: "  dec " }, ["usat"])).toEqual({
      type: "RESULT",
      test: "usat",
      q: "dec",
      page: 1,
    });
    expect(parseNoticeFilters({ test: "general", period: "year", page: "2" }, ["usat"])).toEqual({
      test: "general",
      period: "year",
      page: 2,
    });
  });
  test("noticeWhere always restricts to published", () => {
    expect(noticeWhere({ page: 1 }, today)).toEqual({ published: true });
  });
  test("noticeWhere maps general to no test and a slug to the test relation", () => {
    expect(noticeWhere({ test: "general", page: 1 }, today)).toMatchObject({ published: true, testId: null });
    expect(noticeWhere({ test: "usat", page: 1 }, today)).toMatchObject({ test: { slug: "usat" } });
  });
  test("noticeWhere combines type, period and query", () => {
    expect(noticeWhere({ type: "ADMISSION", period: "30", q: "usat", page: 1 }, today)).toEqual({
      published: true,
      type: "ADMISSION",
      publishedAt: { gte: new Date("2026-09-22T00:00:00Z") },
      OR: [{ title: { contains: "usat" } }, { summary: { contains: "usat" } }],
    });
  });
});

describe("resource filters", () => {
  test("parse keeps known type params and drops the rest", () => {
    expect(parseResourceFilters({ type: "sample-paper", test: "lat" }, ["lat"])).toEqual({ type: "SAMPLE_PAPER", test: "lat", page: 1 });
    expect(parseResourceFilters({ type: "Sample paper" }, ["lat"])).toEqual({ page: 1 });
  });
  test("resourceWhere", () => {
    expect(resourceWhere({ type: "POLICY", test: "general", q: "means", page: 1 })).toEqual({
      published: true,
      type: "POLICY",
      testId: null,
      title: { contains: "means" },
    });
  });
});

describe("faq search", () => {
  const faqs = [
    { category: "TEST_DAY" as const, question: "When can I download my admit card?", answer: "About ten days before." },
    { category: "FEES" as const, question: "How much does each test cost?", answer: "LAT Rs. 2,000." },
  ];
  test("matches question or answer text, case-insensitively", () => {
    expect(searchFaqs(faqs, "ADMIT").map((f) => f.category)).toEqual(["TEST_DAY"]);
    expect(searchFaqs(faqs, "rs. 2,000").map((f) => f.category)).toEqual(["FEES"]);
  });
  test("filters by category and returns all on an empty query", () => {
    expect(searchFaqs(faqs, "", "FEES")).toHaveLength(1);
    expect(searchFaqs(faqs, "  ")).toHaveLength(2);
    expect(searchFaqs(faqs, "zzzz")).toEqual([]);
  });
});

describe("labels", () => {
  test("fromParam maps URL params back to enums", () => {
    expect(fromParam(NOTICE_TYPE, "result")).toBe("RESULT");
    expect(fromParam(FAQ_CATEGORY, "test-day")).toBe("TEST_DAY");
    expect(fromParam(NOTICE_TYPE, "RESULT")).toBeUndefined();
    expect(fromParam(NOTICE_TYPE, undefined)).toBeUndefined();
  });
});
