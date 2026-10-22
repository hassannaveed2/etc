import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FaqForm } from "@/components/admin/faqs/FaqForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { formDataToObject } from "@/lib/admin/form-data";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { saveFaq } from "../actions";

export const metadata: Metadata = { title: "Edit question" };

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("content:write");
  const id = Number((await params).id);
  const f = Number.isInteger(id) ? await prisma.faq.findUnique({ where: { id } }) : null;
  if (!f) notFound();

  async function save(_prev: unknown, fd: FormData) {
    "use server";
    return saveFaq({ ...formDataToObject(fd), id });
  }

  return (
    <>
      <PageHeader title="Edit question" back={{ href: "/admin/faqs", label: "FAQs" }} />
      <FaqForm
        action={save}
        faq={{ id: f.id, category: f.category, question: f.question, answer: f.answer, published: f.published, updatedAt: f.updatedAt.toISOString() }}
      />
    </>
  );
}
