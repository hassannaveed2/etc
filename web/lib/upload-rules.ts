// Upload allow-list and key rules (spec §6). Pure: shared by the browser dropzone and the server.
import { slugify } from "./slug";

export const UPLOAD_RULES = {
  "application/pdf": { ext: "pdf", exts: ["pdf"], max: 15 * 1024 * 1024 },
  "image/jpeg": { ext: "jpg", exts: ["jpg", "jpeg"], max: 5 * 1024 * 1024 },
  "image/png": { ext: "png", exts: ["png"], max: 5 * 1024 * 1024 },
  "image/webp": { ext: "webp", exts: ["webp"], max: 5 * 1024 * 1024 },
} as const;

export type UploadMime = keyof typeof UPLOAD_RULES;

const KEY_RE = /^ETC\/uploads\/\d{4}\/\d{2}\/[a-z0-9-]+\.(pdf|jpg|png|webp)$/;

export function isUploadMime(mime: string): mime is UploadMime {
  return mime in UPLOAD_RULES;
}

export function checkUpload({ mime, size, filename }: { mime: string; size: number; filename: string }): { ok: true } | { ok: false; error: string } {
  if (!isUploadMime(mime)) return { ok: false, error: "Only PDF, JPG, PNG or WebP files can be uploaded." };
  const rule = UPLOAD_RULES[mime];
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (!(rule.exts as readonly string[]).includes(ext)) return { ok: false, error: "The file name doesn’t match its type. Only PDF, JPG, PNG or WebP files can be uploaded." };
  if (!(size > 0)) return { ok: false, error: "This file is empty." };
  if (size > rule.max) return { ok: false, error: mime === "application/pdf" ? "PDFs must be 15 MB or smaller." : "Images must be 5 MB or smaller." };
  return { ok: true };
}

/** ETC/uploads/<yyyy>/<mm>/<id>-<slug>.<ext>; the extension always comes from the checked MIME type. */
export function buildUploadKey(filename: string, mime: string, now: Date, id: string): string {
  if (!isUploadMime(mime)) throw new Error("Unsupported upload type");
  const base = filename.replace(/\.[^.]*$/, "");
  const slug = slugify(base).slice(0, 60).replace(/-+$/, "") || "file";
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `ETC/uploads/${yyyy}/${mm}/${id}-${slug}.${UPLOAD_RULES[mime].ext}`;
}

export function assertEtcUploadKey(key: string): void {
  if (!KEY_RE.test(key) || key.includes("..")) throw new Error("Refusing key outside ETC/uploads/");
}

const startsWith = (b: Uint8Array, sig: number[], at = 0) => sig.every((x, i) => b[at + i] === x);
const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0));

/** The real type from the file's first bytes; null for anything outside the allow-list. */
export function sniffMime(b: Uint8Array): UploadMime | null {
  if (startsWith(b, ascii("%PDF-"))) return "application/pdf";
  if (startsWith(b, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith(b, ascii("RIFF")) && startsWith(b, ascii("WEBP"), 8)) return "image/webp";
  return null;
}
