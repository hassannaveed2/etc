import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { FaqBrowser } from "@/components/site/faqs/FaqBrowser";
import { getFaqs } from "@/lib/content/faqs";

export const metadata: Metadata = pageMetadata({
  title: "Help & FAQs",
  description: "Answers about registration, test day, results, fees, accessibility and institutional testing at ETC.",
  path: "/faqs",
});

export default async function FaqsPage() {
  return <FaqBrowser faqs={await getFaqs()} />;
}
