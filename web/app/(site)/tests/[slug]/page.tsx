import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TestDetail } from "@/components/site/tests/TestDetail";
import { pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/content/settings";
import { getTestBySlug, getTestOptions } from "@/lib/content/tests";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getTestOptions()).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTestBySlug((await params).slug);
  if (!t) return { title: "Test not found" };
  return pageMetadata({
    title: t.seoTitle ?? (t.slug === "customized" ? t.name : `${t.code} — ${t.name}`),
    description: t.seoDescription ?? t.short,
    path: `/tests/${t.slug}`,
    image: t.image?.url,
  });
}

export default async function TestPage({ params }: Props) {
  const [test, settings] = await Promise.all([getTestBySlug((await params).slug), getSettings()]);
  if (!test) notFound();
  return <TestDetail test={test} settings={settings} />;
}
