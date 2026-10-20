// Upload a local directory to DigitalOcean Spaces under ETC/mockup/<remoteSubdir>/.
// Usage: npm run upload -- <localDir> <remoteSubdir> [--exclude=dirName]
// The bucket is shared with other projects, so every key is forced under ETC/mockup/.
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const KEY_PREFIX = "ETC/mockup/";

const TYPES = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  svg: "image/svg+xml",
  pdf: "application/pdf",
};

export function contentTypeFor(file) {
  const ext = path.extname(file).slice(1).toLowerCase();
  return TYPES[ext] ?? "application/octet-stream";
}

export function toEtcKey(relPath) {
  const rel = String(relPath).replace(/\\/g, "/");
  const refuse = () => {
    throw new Error("Refusing key outside ETC/mockup/");
  };
  if (rel.startsWith("/") || /^[a-zA-Z]:/.test(rel)) refuse();
  if (rel.split("/").includes("..")) refuse();
  const key = path.posix.normalize(KEY_PREFIX + rel);
  if (!key.startsWith(KEY_PREFIX)) refuse();
  return key;
}

async function listFiles(dir, exclude) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (exclude.includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      for (const f of await listFiles(full, exclude)) out.push(path.join(entry.name, f));
    } else {
      out.push(entry.name);
    }
  }
  return out;
}

async function main(argv) {
  const args = argv.filter((a) => !a.startsWith("--"));
  const exclude = argv.filter((a) => a.startsWith("--exclude=")).map((a) => a.slice(10));
  const [localDir, remoteSubdir] = args;
  if (!localDir || !remoteSubdir) {
    console.error("Usage: npm run upload -- <localDir> <remoteSubdir> [--exclude=dirName]");
    process.exit(1);
  }
  if (!(await stat(localDir)).isDirectory()) throw new Error(`${localDir} is not a directory`);

  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const env = process.env;
  const s3 = new S3Client({
    endpoint: env.SPACES_ENDPOINT,
    region: env.SPACES_REGION,
    credentials: { accessKeyId: env.SPACES_KEY, secretAccessKey: env.SPACES_SECRET },
  });

  for (const rel of await listFiles(localDir, exclude)) {
    const key = toEtcKey(path.posix.join(remoteSubdir, rel.replace(/\\/g, "/")));
    await s3.send(
      new PutObjectCommand({
        Bucket: env.SPACES_BUCKET,
        Key: key,
        Body: await readFile(path.join(localDir, rel)),
        ACL: "public-read",
        ContentType: contentTypeFor(rel),
        CacheControl: "public, max-age=31536000",
      })
    );
    console.log(`${env.SPACES_CDN_BASE}/${key}`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main(process.argv.slice(2)).catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
