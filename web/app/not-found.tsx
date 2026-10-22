import type { Metadata } from "next";
import { NotFoundBody } from "@/components/site/NotFoundBody";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = { title: "Page not found" };

// Unmatched URLs render here, outside the (site) layout, so this page brings its own chrome.
export default function NotFound() {
  return (
    <SiteShell>
      <NotFoundBody />
    </SiteShell>
  );
}
