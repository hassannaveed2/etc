"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { UploadDropzone } from "./UploadDropzone";

/** Upload area on the media library page; refreshes the grid and announces each finished upload. */
export function LibraryUpload() {
  const router = useRouter();
  const [last, setLast] = useState("");
  return (
    <div>
      <UploadDropzone
        onUploaded={(m) => {
          setLast(`Uploaded ${m.name}.`);
          router.refresh();
        }}
      />
      <p role="status" className="mt-2 text-sm font-semibold text-status-open">
        {last}
      </p>
    </div>
  );
}
