import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { TestForm } from "@/components/admin/tests/TestForm";
import { formDataToObject } from "@/lib/admin/form-data";
import { toMediaItem } from "@/lib/admin/media";
import { requireUser } from "@/lib/auth/session";
import type { Tos, UsatCategory } from "@/lib/content/types";
import { prisma } from "@/lib/db";
import { saveTest } from "../actions";

export const metadata: Metadata = { title: "Edit test" };

export default async function EditTestPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("content:write");
  const id = Number((await params).id);
  const t = Number.isInteger(id) ? await prisma.test.findUnique({ where: { id }, include: { image: true, sections: { orderBy: { order: "asc" } } } }) : null;
  if (!t) notFound();

  async function save(_prev: unknown, fd: FormData) {
    "use server";
    return saveTest({ ...formDataToObject(fd), id });
  }

  return (
    <>
      <PageHeader title={t.name} description={`${t.code} · /tests/${t.slug}`} back={{ href: "/admin/tests", label: "Tests" }} />
      <TestForm
        action={save}
        test={{
          id: t.id,
          slug: t.slug,
          code: t.code,
          name: t.name,
          short: t.short,
          category: t.category,
          level: t.level,
          audience: t.audience,
          purpose: t.purpose,
          eligibility: t.eligibility,
          measures: t.measures,
          frequency: t.frequency,
          frequencyNote: t.frequencyNote,
          fee: t.fee,
          resultsUse: t.resultsUse,
          patternNote: t.patternNote,
          reliability: t.reliability,
          syllabus: t.syllabus as string[],
          categories: (t.categories as UsatCategory[] | null) ?? null,
          tos: (t.tos as Tos | null) ?? null,
          sections: t.sections.map((s) => ({ name: s.name, items: s.items, detail: s.detail })),
          image: t.image ? toMediaItem(t.image) : null,
          sortOrder: t.sortOrder,
          published: t.published,
          seoTitle: t.seoTitle,
          seoDescription: t.seoDescription,
          updatedAt: t.updatedAt.toISOString(),
        }}
      />
    </>
  );
}
