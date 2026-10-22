"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

const BTN =
  "inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-green-700 ring-1 ring-green-700/30 hover:bg-mint-50";

/** Share (Web Share API, falling back to copying the link) and print, as on the mockup's notice and test pages. */
export function ShareButtons({ title, noun }: { title: string; noun: string }) {
  const [status, setStatus] = useState("");
  async function share() {
    const data = { title, url: location.href };
    if (navigator.share) {
      navigator.share(data).catch(() => {});
      return;
    }
    try {
      await navigator.clipboard.writeText(data.url);
      setStatus("Link copied to clipboard.");
    } catch {
      setStatus(`Copy this link: ${data.url}`);
    }
  }
  return (
    <>
      <button type="button" onClick={share} className={BTN}>
        <Icon name="external" className="h-4 w-4" />
        Share {noun}
      </button>
      <button type="button" onClick={() => window.print()} className={BTN}>
        <Icon name="print" className="h-4 w-4" />
        Print {noun}
      </button>
      <p role="status" className="w-full text-sm text-muted">
        {status}
      </p>
    </>
  );
}
