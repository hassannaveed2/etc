import type { Metadata } from "next";
import { FaqForm } from "@/components/admin/faqs/FaqForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { formDataToObject } from "@/lib/admin/form-data";
import { requireUser } from "@/lib/auth/session";
import { saveFaq } from "../actions";

export const metadata: Metadata = { title: "New question" };

export default async function NewFaqPage() {
  await requireUser("content:write");

  async function save(_prev: unknown, fd: FormData) {
    "use server";
    return saveFaq(formDataToObject(fd));
  }

  return (
    <>
      <PageHeader title="New question" back={{ href: "/admin/faqs", label: "FAQs" }} />
      <FaqForm action={save} faq={{ category: "", question: "", answer: "", published: false }} />
    </>
  );
}
