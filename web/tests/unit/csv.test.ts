import { expect, test } from "vitest";
import { toCsv } from "@/lib/admin/csv";

const cols = [
  { key: "a", header: "A" },
  { key: "b", header: "B" },
  { key: "c", header: "C" },
];

test("BOM, header row, CRLF line endings and every field quoted", () => {
  const csv = toCsv([{ a: "x", b: "y", c: "z" }], cols);
  expect(csv).toBe('﻿"A","B","C"\r\n"x","y","z"\r\n');
});

test("inner quotes are doubled and newlines kept inside quotes", () => {
  const csv = toCsv([{ a: 'He said "hi"', b: "line 1\nline 2", c: null }], cols);
  expect(csv).toContain('"He said ""hi"""');
  expect(csv).toContain('"line 1\nline 2"');
  expect(csv).toContain(',""\r\n');
});

// Review Focus 1: spreadsheet formula injection from public form input
test("cells that a spreadsheet would run as formulas are neutralised", () => {
  const csv = toCsv([{ a: '=HYPERLINK("http://x")', b: "-5", c: "@SUM(A1)" }], cols);
  expect(csv).toContain(`"'=HYPERLINK(""http://x"")"`);
  expect(csv).toContain(`"'-5"`);
  expect(csv).toContain(`"'@SUM(A1)"`);
  expect(toCsv([{ a: "+92 300", b: "\tTAB", c: "\rCR" }], cols)).toContain(`"'+92 300","'\tTAB","'\rCR"`);
});

test("dates are written in Pakistan time as YYYY-MM-DD HH:mm; numbers as plain text", () => {
  const csv = toCsv([{ a: new Date("2026-10-22T10:05:00Z"), b: 1200, c: true }], cols);
  expect(csv).toContain('"2026-10-22 15:05","1200","true"');
});
