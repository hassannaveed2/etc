const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const FEE_NOTE = "As per ETC Institutional Profile 2026; always confirm in the official announcement.";

export function formatFee(fee: number | null): string {
  return fee == null ? "By agreement" : `Rs. ${fee.toLocaleString("en-US")}`;
}

/** "15 Oct 2026". Date-only values are stored at UTC midnight, so UTC parts are the calendar date. */
export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(`${d.slice(0, 10)}T00:00:00Z`) : d;
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** Today's calendar date in Pakistan, as UTC midnight (comparable with @db.Date columns). */
export function todayInKarachi(now: Date = new Date()): Date {
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi" }).format(now);
  return new Date(`${ymd}T00:00:00Z`);
}

/** ISO calendar date "2026-10-15" from a date-only value. */
export function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** "420 KB" / "1.2 MB", as shown on resource cards and attachments. */
export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
