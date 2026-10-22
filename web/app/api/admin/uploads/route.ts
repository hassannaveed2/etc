import { randomUUID } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { writeAudit } from "@/lib/admin/audit";
import { toMediaItem } from "@/lib/admin/media";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { can } from "@/lib/rbac";
import { buildUploadKey, checkUpload, publicUrl, putObject, sniffMime, spacesConfigured } from "@/lib/spaces";

const fail = (formError: string, status = 400) => NextResponse.json({ ok: false, formError }, { status });

/**
 * Receives one file (multipart: file, alt), checks role, type/size allow-list and the file's real content type,
 * stores it under ETC/uploads/ on Spaces and records it in the media library (spec §5–6).
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("Your session has expired. Sign in again.", 401);
  if (!can(user.role, "media:upload")) return fail("You don't have permission to upload files.", 403);
  if (!spacesConfigured()) return fail("File storage is not configured on this server.", 503);

  const fd = await req.formData().catch(() => null);
  const file = fd?.get("file");
  if (!(file instanceof File)) return fail("Choose a file to upload.");
  const alt = String(fd?.get("alt") ?? "").trim().slice(0, 500);

  const check = checkUpload({ mime: file.type, size: file.size, filename: file.name });
  if (!check.ok) return fail(check.error);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const real = sniffMime(bytes);
  if (real !== file.type) {
    return fail("This file’s contents don’t match its type. Only PDF, JPG, PNG or WebP files can be uploaded.");
  }
  if (real!.startsWith("image/") && !alt) return fail("Describe the image for people who can’t see it (alt text).");

  let width: number | null = null;
  let height: number | null = null;
  if (real!.startsWith("image/")) {
    const meta = await sharp(bytes).metadata().catch(() => null);
    if (!meta?.width || !meta.height) return fail("This image couldn’t be read. Try saving it again as JPG or PNG.");
    width = meta.width;
    height = meta.height;
  }

  const key = buildUploadKey(file.name, real!, new Date(), randomUUID().slice(0, 8));
  try {
    await putObject(key, bytes, real!);
  } catch (e) {
    console.error("[admin] upload to Spaces failed:", e instanceof Error ? e.name : "unknown");
    return fail("The file couldn’t be stored. Please try again.", 502);
  }

  const m = await prisma.media.create({
    data: { key, url: publicUrl(key), mime: real!, size: file.size, width, height, alt, uploadedById: user.id },
  });
  const item = toMediaItem(m);
  await writeAudit({ userId: user.id, action: "UPLOAD", entity: "Media", entityId: String(m.id), summary: `Uploaded ${item.name}` });
  revalidateTag("media");
  return NextResponse.json({ ok: true, data: item });
}
