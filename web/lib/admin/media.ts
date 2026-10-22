import type { Media } from "@prisma/client";

/** Media as the admin UI sees it (plain JSON). */
export type MediaItem = {
  id: number;
  key: string;
  name: string;
  url: string;
  mime: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string;
  createdAt: string;
};

export const mediaName = (key: string) => {
  const file = key.split("/").pop() ?? key;
  return file.replace(/^[0-9a-f]{8}-/, "");
};

export const toMediaItem = (m: Media): MediaItem => ({
  id: m.id,
  key: m.key,
  name: mediaName(m.key),
  url: m.url,
  mime: m.mime,
  size: m.size,
  width: m.width,
  height: m.height,
  alt: m.alt,
  createdAt: m.createdAt.toISOString(),
});

export const isImage = (mime: string) => mime.startsWith("image/");
