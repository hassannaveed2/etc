"use client";

import type { MediaItem } from "./media";
import type { ActionResult } from "./result";

/** Sends one file to /api/admin/uploads with upload progress; the server checks it and stores it on Spaces. */
export function uploadFile(file: File, alt: string, onProgress: (pct: number) => void): Promise<ActionResult<MediaItem>> {
  return new Promise((resolve) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("alt", alt);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/uploads");
    xhr.responseType = "json";
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      const body = xhr.response as ActionResult<MediaItem> | null;
      resolve(body && "ok" in body ? body : { ok: false, formError: "The upload didn’t complete. Please try again." });
    };
    xhr.onerror = () => resolve({ ok: false, formError: "The upload didn’t complete. Check your connection and try again." });
    xhr.send(fd);
  });
}
