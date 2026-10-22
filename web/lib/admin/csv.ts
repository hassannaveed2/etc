// CSV export for the inbox. Opens cleanly in Excel (UTF-8 BOM, CRLF) and never lets public form input become a formula.

const FORMULA_START = /^[=+\-@\t\r]/;

const pk = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Karachi",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function cell(v: unknown): string {
  let s: string;
  if (v == null) s = "";
  else if (v instanceof Date) s = pk.format(v).replace(", ", " ");
  else s = String(v);
  // Spreadsheet formula injection (Review Focus 1): =, +, -, @, tab or CR at the start would be executed.
  if (FORMULA_START.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function toCsv(rows: Record<string, unknown>[], columns: { key: string; header: string }[]): string {
  const lines = [columns.map((c) => cell(c.header)), ...rows.map((r) => columns.map((c) => cell(r[c.key])))];
  return "﻿" + lines.map((l) => l.join(",")).join("\r\n") + "\r\n";
}
