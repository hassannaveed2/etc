// DigitalOcean Spaces (S3-compatible). The bucket is shared with other projects: the app only ever writes and
// deletes keys under ETC/uploads/ (seed media under ETC/mockup/ is never touched).
import "server-only";
import { assertEtcUploadKey, type UploadMime } from "./upload-rules";

export { assertEtcUploadKey, buildUploadKey, checkUpload, isUploadMime, sniffMime, UPLOAD_RULES, type UploadMime } from "./upload-rules";

function spacesEnv() {
  const { SPACES_ENDPOINT, SPACES_REGION, SPACES_BUCKET, SPACES_KEY, SPACES_SECRET, SPACES_CDN_BASE } = process.env;
  if (!SPACES_ENDPOINT || !SPACES_BUCKET || !SPACES_KEY || !SPACES_SECRET || !SPACES_CDN_BASE) {
    throw new Error("Spaces is not configured");
  }
  return { endpoint: SPACES_ENDPOINT, region: SPACES_REGION || "sgp1", bucket: SPACES_BUCKET, key: SPACES_KEY, secret: SPACES_SECRET, cdn: SPACES_CDN_BASE };
}

export function spacesConfigured(): boolean {
  try {
    spacesEnv();
    return true;
  } catch {
    return false;
  }
}

async function client() {
  const { S3Client } = await import("@aws-sdk/client-s3");
  const env = spacesEnv();
  return { s3: new S3Client({ endpoint: env.endpoint, region: env.region, credentials: { accessKeyId: env.key, secretAccessKey: env.secret } }), env };
}

/** Stores a public-read object under ETC/uploads/ with a long cache lifetime (keys are unique per upload). */
export async function putObject(key: string, body: Uint8Array, mime: UploadMime): Promise<void> {
  assertEtcUploadKey(key);
  const { PutObjectCommand } = await import("@aws-sdk/client-s3");
  const { s3, env } = await client();
  await s3.send(
    new PutObjectCommand({
      Bucket: env.bucket,
      Key: key,
      Body: body,
      ContentType: mime,
      ACL: "public-read",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

export async function deleteObject(key: string): Promise<void> {
  assertEtcUploadKey(key);
  const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
  const { s3, env } = await client();
  await s3.send(new DeleteObjectCommand({ Bucket: env.bucket, Key: key }));
}

export function publicUrl(key: string): string {
  return `${spacesEnv().cdn.replace(/\/$/, "")}/${key}`;
}
