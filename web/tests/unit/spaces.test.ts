import { describe, expect, test } from "vitest";
import { assertEtcUploadKey, buildUploadKey, checkUpload, sniffMime, UPLOAD_RULES } from "@/lib/upload-rules";

const d = new Date("2026-10-22T10:00:00Z");

describe("upload keys", () => {
  test("keys live under ETC/uploads/yyyy/mm with a uuid and a slug of the file name", () => {
    expect(buildUploadKey("USAT Syllabus (E).PDF", "application/pdf", d, "3f2a")).toBe("ETC/uploads/2026/10/3f2a-usat-syllabus-e.pdf");
    expect(buildUploadKey("Hero photo.jpeg", "image/jpeg", d, "ab12")).toBe("ETC/uploads/2026/10/ab12-hero-photo.jpg");
  });
  test("names with nothing usable fall back to 'file'", () => {
    expect(buildUploadKey("داخلہ.pdf", "application/pdf", d, "ab")).toBe("ETC/uploads/2026/10/ab-file.pdf");
  });
  test("the extension comes from the checked MIME type, not the file name", () => {
    expect(buildUploadKey("x.php.png", "image/png", d, "c1")).toBe("ETC/uploads/2026/10/c1-x-php.png");
  });
  test("assertEtcUploadKey refuses anything outside ETC/uploads", () => {
    expect(() => assertEtcUploadKey("ETC/uploads/2026/10/ab-file.pdf")).not.toThrow();
    for (const bad of ["ETC/mockup/x.jpg", "ETC/uploads/2026/10/../../x.pdf", "other/ETC/uploads/2026/10/a.pdf", "ETC/uploads/2026/10/a.exe", "/ETC/uploads/2026/10/a.pdf"]) {
      expect(() => assertEtcUploadKey(bad), bad).toThrow("Refusing key outside ETC/uploads/");
    }
  });
});

describe("checkUpload", () => {
  test("size limits per type", () => {
    expect(UPLOAD_RULES["application/pdf"].max).toBe(15 * 1024 * 1024);
    expect(checkUpload({ mime: "application/pdf", size: 15 * 1024 * 1024 + 1, filename: "a.pdf" })).toEqual({ ok: false, error: "PDFs must be 15 MB or smaller." });
    expect(checkUpload({ mime: "image/png", size: 5 * 1024 * 1024 + 1, filename: "a.png" })).toEqual({ ok: false, error: "Images must be 5 MB or smaller." });
    expect(checkUpload({ mime: "image/webp", size: 5 * 1024 * 1024, filename: "a.webp" })).toEqual({ ok: true });
  });
  test("only PDF, JPG, PNG and WebP are accepted", () => {
    expect(checkUpload({ mime: "image/svg+xml", size: 10, filename: "a.svg" })).toEqual({ ok: false, error: "Only PDF, JPG, PNG or WebP files can be uploaded." });
  });
  test("the file name extension must match the type", () => {
    expect(checkUpload({ mime: "application/pdf", size: 10, filename: "a.exe" }).ok).toBe(false);
    expect(checkUpload({ mime: "image/jpeg", size: 10, filename: "photo.JPEG" }).ok).toBe(true);
  });
  test("empty files are refused", () => {
    expect(checkUpload({ mime: "application/pdf", size: 0, filename: "a.pdf" })).toEqual({ ok: false, error: "This file is empty." });
  });
});

describe("sniffMime", () => {
  const bytes = (...b: number[]) => new Uint8Array([...b, ...new Array(16).fill(0)]);
  test("recognises PDF, JPEG, PNG and WebP by their first bytes", () => {
    expect(sniffMime(new TextEncoder().encode("%PDF-1.7\n..."))).toBe("application/pdf");
    expect(sniffMime(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("image/jpeg");
    expect(sniffMime(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe("image/png");
    expect(sniffMime(new TextEncoder().encode("RIFF\x00\x00\x00\x00WEBPVP8 "))).toBe("image/webp");
  });
  test("anything else is null (a renamed executable or HTML file)", () => {
    expect(sniffMime(new TextEncoder().encode("MZ\x90\x00"))).toBeNull();
    expect(sniffMime(new TextEncoder().encode("<html><script>"))).toBeNull();
    expect(sniffMime(new Uint8Array())).toBeNull();
  });
});
