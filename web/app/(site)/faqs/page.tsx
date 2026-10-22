import type { Metadata } from "next";
import { FaqBrowser } from "@/components/site/faqs/FaqBrowser";
import { getFaqs } from "@/lib/content/faqs";

export const metadata: Metadata = {
  title: "Help & FAQs",
  description: "Answers about registration, test day, results, fees, accessibility and institutional testing at ETC.",
};

export default async function FaqsPage() {
  return <FaqBrowser faqs={await getFaqs()} />;
}
